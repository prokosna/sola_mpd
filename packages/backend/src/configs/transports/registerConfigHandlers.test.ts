import { create, toBinary } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	SOCKETIO_CONFIG_CHANGED,
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeMessagingServer } from "../../lib/messaging/fakeMessagingServer.js";
import type { ConfigRepositories } from "../repositories/ConfigRepository.js";
import { registerConfigHandlers } from "./registerConfigHandlers.js";

const makeRepository = () => ({ get: vi.fn(), update: vi.fn() });
const browserState = makeRepository();
const configRepositories = {
	browserState,
	commonSongTableState: makeRepository(),
	mpdProfileState: makeRepository(),
	pluginState: makeRepository(),
	recentlyAddedState: makeRepository(),
	savedSearches: makeRepository(),
} as unknown as ConfigRepositories;

const saveChannel = `${SOCKETIO_CONFIG_SAVE}_${CONFIG_KEY_BROWSER_STATE}`;
const fetchChannel = `${SOCKETIO_CONFIG_FETCH}_${CONFIG_KEY_BROWSER_STATE}`;

describe("registerConfigHandlers", () => {
	let fake: ReturnType<typeof createFakeMessagingServer>;

	beforeEach(() => {
		vi.clearAllMocks();
		fake = createFakeMessagingServer();
		registerConfigHandlers(fake.server, { configRepositories });
	});

	it("registers a fetch and a save channel for each config key", () => {
		expect(fake.channels()).toHaveLength(12);
		expect(fake.channels()).toContain(fetchChannel);
		expect(fake.channels()).toContain(saveChannel);
	});

	it("returns the stored config on fetch", async () => {
		const state = create(BrowserStateSchema, { schemaVersion: 2 });
		browserState.get.mockReturnValueOnce(state);

		const result = await fake.call(fetchChannel);

		expect(Buffer.from(result as Uint8Array)).toEqual(
			Buffer.from(toBinary(BrowserStateSchema, state)),
		);
	});

	it("lets a fetch failure reject", async () => {
		browserState.get.mockImplementationOnce(() => {
			throw new Error("disk full");
		});

		await expect(fake.call(fetchChannel)).rejects.toThrow("disk full");
	});

	it("saves the config and broadcasts the key to every peer except the sender", async () => {
		const { peer } = fake.createPeer("sender");
		const payload = toBinary(
			BrowserStateSchema,
			create(BrowserStateSchema, { schemaVersion: 2 }),
		);

		await fake.call(saveChannel, payload, peer);

		expect(browserState.update).toHaveBeenCalledWith(
			expect.objectContaining({ schemaVersion: 2 }),
		);
		expect(fake.broadcast).toHaveBeenCalledTimes(1);
		const [channel, data, options] = fake.broadcast.mock.calls[0];
		expect(channel).toBe(SOCKETIO_CONFIG_CHANGED);
		expect(Buffer.from(data).toString("utf-8")).toBe(CONFIG_KEY_BROWSER_STATE);
		expect(options).toEqual({ except: "sender" });
	});

	it("rejects an undecodable save without updating or broadcasting", async () => {
		await expect(
			fake.call(saveChannel, new Uint8Array([0xff, 0xff, 0xff])),
		).rejects.toThrow();
		expect(browserState.update).not.toHaveBeenCalled();
		expect(fake.broadcast).not.toHaveBeenCalled();
	});

	it("still succeeds when the broadcast itself throws", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		fake.broadcast.mockImplementation(() => {
			throw new Error("boom");
		});

		await expect(fake.call(saveChannel)).resolves.toBeUndefined();
		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	it("rejects and does not broadcast when the save itself fails", async () => {
		browserState.update.mockImplementationOnce(() => {
			throw new Error("disk full");
		});

		await expect(fake.call(saveChannel)).rejects.toThrow("disk full");
		expect(fake.broadcast).not.toHaveBeenCalled();
	});
});
