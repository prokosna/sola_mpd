import {
	CONFIG_KEY_BROWSER_STATE,
	SOCKETIO_CONFIG_CHANGED,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { Server as IOServer } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";

// SocketIoManager.initialize() transitively imports the config and view-state
// blob repository singletons, which touch the filesystem (packages/backend/db)
// at module-load time. Mocking these two leaf modules keeps the test fully
// off disk while leaving the routing/broadcast logic under test untouched.
vi.mock("./configs/repositories/ConfigRepositoryFile.js", () => {
	const makeRepository = () => ({ get: vi.fn(), update: vi.fn() });
	return {
		browserStateRepository: makeRepository(),
		commonSongTableStateRepository: makeRepository(),
		mpdProfileStateRepository: makeRepository(),
		pluginStateRepository: makeRepository(),
		savedSearchRepository: makeRepository(),
		recentlyAddedStateRepository: makeRepository(),
	};
});

vi.mock(
	"./view_state_blobs/repositories/ViewStateBlobRepositoryFile.js",
	() => ({
		viewStateBlobRepository: { get: vi.fn(), put: vi.fn(), sweep: vi.fn() },
	}),
);

const { SocketIoManager } = await import("./SocketIoManager.js");
const { browserStateRepository } = await import(
	"./configs/repositories/ConfigRepositoryFile.js"
);

interface FakeSocket {
	id: string;
	on: ReturnType<typeof vi.fn>;
	emit: ReturnType<typeof vi.fn>;
	join: ReturnType<typeof vi.fn>;
	leave: ReturnType<typeof vi.fn>;
	broadcast: { emit: ReturnType<typeof vi.fn> };
}

function createFakeSocket(id = "socket-1"): FakeSocket {
	return {
		id,
		on: vi.fn(),
		emit: vi.fn(),
		join: vi.fn(),
		leave: vi.fn(),
		broadcast: { emit: vi.fn() },
	};
}

function initializeWithFakeSocket(): {
	socket: FakeSocket;
	getHandler: (
		event: string,
	) => (msg: ArrayBuffer, callback: () => void) => void;
} {
	const connectionHandlers: Array<(socket: FakeSocket) => void> = [];
	const fakeIo = {
		on: vi.fn((event: string, handler: (socket: FakeSocket) => void) => {
			if (event === "connection") {
				connectionHandlers.push(handler);
			}
		}),
	} as unknown as IOServer;

	SocketIoManager.initialize(fakeIo);

	const socket = createFakeSocket();
	for (const handler of connectionHandlers) {
		handler(socket);
	}

	const getHandler = (event: string) => {
		const call = socket.on.mock.calls.find(([name]) => name === event);
		if (call === undefined) {
			throw new Error(`No handler registered for ${event}`);
		}
		return call[1];
	};

	return { socket, getHandler };
}

describe("SocketIoManager config save broadcast", () => {
	const saveEvent = `socketio_config_save_${CONFIG_KEY_BROWSER_STATE}`;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("broadcasts config-changed with the config key after a successful save", () => {
		const { socket, getHandler } = initializeWithFakeSocket();
		const handler = getHandler(saveEvent);
		const callback = vi.fn();

		handler(new ArrayBuffer(0), callback);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(socket.broadcast.emit).toHaveBeenCalledTimes(1);
		const [event, payload] = socket.broadcast.emit.mock.calls[0];
		expect(event).toBe(SOCKETIO_CONFIG_CHANGED);
		expect(Buffer.from(payload).toString("utf-8")).toBe(
			CONFIG_KEY_BROWSER_STATE,
		);
	});

	it("uses the except-sender broadcast primitive, not io.emit", () => {
		const { socket, getHandler } = initializeWithFakeSocket();
		const handler = getHandler(saveEvent);

		handler(new ArrayBuffer(0), vi.fn());

		// socket.broadcast.emit reaches every other connected client but never
		// the socket it was called on; asserting the call landed on
		// socket.broadcast (not socket.emit or a plain io.emit) verifies the
		// sender-exclusion primitive was actually used.
		expect(socket.broadcast.emit).toHaveBeenCalled();
		expect(socket.emit).not.toHaveBeenCalledWith(
			SOCKETIO_CONFIG_CHANGED,
			expect.anything(),
		);
	});

	it("still acknowledges the save when the broadcast itself throws", () => {
		const { socket, getHandler } = initializeWithFakeSocket();
		socket.broadcast.emit.mockImplementation(() => {
			throw new Error("boom");
		});
		const handler = getHandler(saveEvent);
		const callback = vi.fn();

		expect(() => handler(new ArrayBuffer(0), callback)).not.toThrow();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("does not broadcast when the save itself fails", () => {
		vi.mocked(browserStateRepository.update).mockImplementation(() => {
			throw new Error("disk full");
		});

		const { socket, getHandler } = initializeWithFakeSocket();
		const handler = getHandler(saveEvent);
		const callback = vi.fn();

		handler(new ArrayBuffer(0), callback);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(socket.broadcast.emit).not.toHaveBeenCalled();
	});
});
