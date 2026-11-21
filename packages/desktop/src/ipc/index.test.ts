import { create, toBinary } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_EVENT,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
	SOCKETIO_VIEW_STATE_BLOB_FETCH,
	SOCKETIO_VIEW_STATE_BLOB_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { BrowserWindow } from "electron";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BackendDependencies } from "#backend/createBackendDependencies.js";
import { createMpdErrorBuffer } from "#backend/utils/errorBufferUtils.js";
import { ALLOWED_INVOKE_CHANNELS } from "../preload/channels.js";

type IpcHandler = (event: unknown, ...args: unknown[]) => unknown;
const registeredHandlers = new Map<string, IpcHandler>();

vi.mock("electron", () => ({
	ipcMain: {
		handle: vi.fn((channel: string, handler: IpcHandler) => {
			registeredHandlers.set(channel, handler);
		}),
	},
}));

const executeMpdCommandUseCase = vi.fn();
const executeMpdCommandBulkUseCase = vi.fn();
const subscribeMpdEventsUseCase = vi.fn();
const unsubscribeMpdEventsUseCase = vi.fn();
const disconnectMpdEventsUseCase = vi.fn();
vi.mock("#backend/mpd/application/mpdUseCases.js", () => ({
	executeMpdCommandUseCase,
	executeMpdCommandBulkUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
	disconnectMpdEventsUseCase,
}));
const browserStateRepository = {
	get: vi.fn(),
	update: vi.fn(),
};
const makeRepository = () => ({ get: vi.fn(), update: vi.fn() });
const viewStateBlobRepository = {
	get: vi.fn(),
	put: vi.fn(),
	sweep: vi.fn(),
};
const deps = {
	mpdClient: {},
	pluginClient: {},
	advancedSearchApi: {},
	configRepositories: {
		browserState: browserStateRepository,
		commonSongTableState: makeRepository(),
		mpdProfileState: makeRepository(),
		pluginState: makeRepository(),
		recentlyAddedState: makeRepository(),
		savedSearches: makeRepository(),
	},
	viewStateBlobRepository,
} as unknown as BackendDependencies;

const readViewStateBlobUseCase = vi.fn();
const saveViewStateBlobUseCase = vi.fn();
vi.mock(
	"#backend/view_state_blobs/application/viewStateBlobUseCases.js",
	() => ({
		readViewStateBlobUseCase,
		saveViewStateBlobUseCase,
	}),
);

vi.mock("#backend/plugins/application/pluginUseCases.js", () => ({
	registerPluginUseCase: vi.fn(),
	executePluginUseCase: vi.fn(),
}));
vi.mock(
	"#backend/advanced_search/application/advancedSearchUseCases.js",
	() => ({
		executeAdvancedSearchCommandUseCase: vi.fn(),
	}),
);

const { initializeIpcManager } = await import("./index.js");

function createFakeWindow() {
	const closeListeners: Array<() => Promise<void> | void> = [];
	const win = {
		on: vi.fn((event: string, listener: () => Promise<void> | void) => {
			if (event === "closed") {
				closeListeners.push(listener);
			}
		}),
	} as unknown as BrowserWindow;

	return {
		win,
		triggerClosed: async () => {
			for (const listener of closeListeners) {
				await listener();
			}
		},
	};
}

function getHandler(channel: string): IpcHandler {
	const handler = registeredHandlers.get(channel);
	if (handler === undefined) {
		throw new Error(`No IPC handler registered for channel: ${channel}`);
	}
	return handler;
}

describe("initializeIpcManager", () => {
	beforeAll(() => {
		const { win } = createFakeWindow();
		initializeIpcManager(win, deps);
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("registers handlers matching ALLOWED_INVOKE_CHANNELS 1-to-1 and only once", () => {
		const firstCount = registeredHandlers.size;
		const { win: win2 } = createFakeWindow();
		initializeIpcManager(win2, deps);

		expect(registeredHandlers.size).toBe(firstCount);
		expect([...registeredHandlers.keys()].sort()).toEqual(
			[...ALLOWED_INVOKE_CHANNELS].sort(),
		);
	});

	it("routes MPD command success and converts errors into error buffers", async () => {
		const handler = getHandler(SOCKETIO_MPD_COMMAND);

		const expected = new Uint8Array([1, 2, 3]);
		executeMpdCommandUseCase.mockResolvedValueOnce(expected);
		expect(await handler({}, new Uint8Array([9]))).toEqual(expected);

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const err = new Error("mpd boom");
		executeMpdCommandUseCase.mockRejectedValueOnce(err);
		const errorResp = await handler({}, new Uint8Array([9]));
		expect(errorResp).toEqual(createMpdErrorBuffer(err));
		errorSpy.mockRestore();
	});

	it("forwards config fetch/save and rethrows errors", () => {
		const fetchHandler = getHandler(
			`${SOCKETIO_CONFIG_FETCH}_${CONFIG_KEY_BROWSER_STATE}`,
		);
		const saveHandler = getHandler(
			`${SOCKETIO_CONFIG_SAVE}_${CONFIG_KEY_BROWSER_STATE}`,
		);

		const state = create(BrowserStateSchema, { schemaVersion: 2 });
		browserStateRepository.get.mockReturnValueOnce(state);
		expect(fetchHandler({})).toEqual(
			new Uint8Array(toBinary(BrowserStateSchema, state)),
		);

		const payload = toBinary(BrowserStateSchema, state);
		expect(saveHandler({}, payload)).toEqual(new Uint8Array(0));
		expect(browserStateRepository.update).toHaveBeenCalledWith(
			expect.objectContaining({ schemaVersion: 2 }),
		);

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		browserStateRepository.get.mockImplementationOnce(() => {
			throw new Error("disk full");
		});
		expect(() => fetchHandler({})).toThrow("disk full");
		errorSpy.mockRestore();
	});

	it("saves and fetches view state blobs with empty buffer for unknown tokens", () => {
		const saveHandler = getHandler(SOCKETIO_VIEW_STATE_BLOB_SAVE);
		const fetchHandler = getHandler(SOCKETIO_VIEW_STATE_BLOB_FETCH);

		saveViewStateBlobUseCase.mockReturnValueOnce("tok-1");
		const tokenBytes = saveHandler(
			{},
			new Uint8Array(Buffer.from("blob-body", "utf-8")),
		) as Uint8Array;
		expect(Buffer.from(tokenBytes).toString("utf-8")).toBe("tok-1");

		readViewStateBlobUseCase.mockReturnValueOnce("blob-body");
		const fetched = fetchHandler(
			{},
			new Uint8Array(Buffer.from("tok-1", "utf-8")),
		) as Uint8Array;
		expect(Buffer.from(fetched).toString("utf-8")).toBe("blob-body");

		readViewStateBlobUseCase.mockReturnValueOnce(undefined);
		const missing = fetchHandler(
			{},
			new Uint8Array(Buffer.from("missing", "utf-8")),
		) as Uint8Array;
		expect(missing).toEqual(new Uint8Array(0));
	});

	it("deduplicates MPD subscriptions, guards destroyed senders, and cleans up on window close", async () => {
		const { win, triggerClosed } = createFakeWindow();
		initializeIpcManager(win, deps);

		const subscribeHandler = getHandler(SOCKETIO_MPD_SUBSCRIBE);
		const unsubscribeHandler = getHandler(SOCKETIO_MPD_UNSUBSCRIBE);

		const profile = create(MpdProfileSchema, {
			name: "Test",
			host: "127.0.0.1",
			port: 6600,
			password: "",
		});
		const profileBytes = toBinary(MpdProfileSchema, profile);

		let capturedOnEvent:
			| ((event: ReturnType<typeof create<typeof MpdEventSchema>>) => void)
			| undefined;
		const fakeSubscription = { disconnect: vi.fn() };
		subscribeMpdEventsUseCase.mockImplementationOnce(
			async ({ onEvent }: { onEvent: typeof capturedOnEvent }) => {
				capturedOnEvent = onEvent;
				return { handlerPromise: Promise.resolve(fakeSubscription) };
			},
		);

		let destroyed = false;
		const sender = {
			isDestroyed: () => destroyed,
			send: vi.fn(),
		};

		await subscribeHandler({ sender }, profileBytes);
		// Second subscribe for the same profile should reuse existing subscription.
		await subscribeHandler({ sender }, profileBytes);
		expect(subscribeMpdEventsUseCase).toHaveBeenCalledTimes(1);

		const updateEvent = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.DATABASE,
		});
		capturedOnEvent?.(updateEvent);
		expect(sender.send).toHaveBeenCalledWith(
			SOCKETIO_MPD_EVENT,
			toBinary(MpdEventSchema, updateEvent),
		);

		destroyed = true;
		capturedOnEvent?.(updateEvent);
		expect(sender.send).toHaveBeenCalledTimes(1);

		await triggerClosed();
		expect(disconnectMpdEventsUseCase).toHaveBeenCalledTimes(1);

		// Unsubscribing when not subscribed is a safe no-op.
		expect(await unsubscribeHandler({}, profileBytes)).toEqual(
			new Uint8Array(0),
		);
		expect(unsubscribeMpdEventsUseCase).not.toHaveBeenCalled();
	});
});
