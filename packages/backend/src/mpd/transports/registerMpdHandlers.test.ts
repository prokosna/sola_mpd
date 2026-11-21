import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	MpdRequestBulkSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeMessagingServer } from "../../lib/messaging/fakeMessagingServer.js";
import { createMpdErrorBuffer } from "../../utils/errorBufferUtils.js";
import type { MpdClient } from "../services/MpdClient.js";
import { registerMpdHandlers } from "./registerMpdHandlers.js";

const profile = create(MpdProfileSchema, {
	name: "default",
	host: "localhost",
	port: 6600,
});
const profileBytes = toBinary(MpdProfileSchema, profile);

describe("registerMpdHandlers", () => {
	const mpdClient = {
		execute: vi.fn(),
		executeBulk: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
	};
	let fake: ReturnType<typeof createFakeMessagingServer>;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(console, "info").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
		fake = createFakeMessagingServer();
		registerMpdHandlers(fake.server, {
			mpdClient: mpdClient as unknown as MpdClient,
		});
	});

	it("executes a command and returns the encoded response", async () => {
		mpdClient.execute.mockResolvedValue(
			create(MpdResponseSchema, { command: { case: "ping", value: {} } }),
		);
		const request = toBinary(
			MpdRequestSchema,
			create(MpdRequestSchema, { command: { case: "ping", value: {} } }),
		);

		const result = await fake.call(SOCKETIO_MPD_COMMAND, request);

		expect(
			fromBinary(MpdResponseSchema, result as Uint8Array).command.case,
		).toBe("ping");
	});

	it("maps a command failure to an MPD error response", async () => {
		const err = new Error("mpd boom");
		mpdClient.execute.mockRejectedValue(err);
		const request = toBinary(
			MpdRequestSchema,
			create(MpdRequestSchema, { command: { case: "ping", value: {} } }),
		);

		const result = await fake.call(SOCKETIO_MPD_COMMAND, request);

		expect(result).toEqual(createMpdErrorBuffer(err));
	});

	it("runs a bulk command and rejects on failure", async () => {
		mpdClient.executeBulk.mockResolvedValueOnce(undefined);
		const bulk = toBinary(
			MpdRequestBulkSchema,
			create(MpdRequestBulkSchema, {
				requests: [{ command: { case: "ping", value: {} } }],
			}),
		);

		expect(await fake.call(SOCKETIO_MPD_COMMAND_BULK, bulk)).toBeUndefined();

		const err = new Error("bulk boom");
		mpdClient.executeBulk.mockRejectedValueOnce(err);
		await expect(fake.call(SOCKETIO_MPD_COMMAND_BULK, bulk)).rejects.toBe(err);
	});

	it("subscribes the calling peer and returns nothing", async () => {
		mpdClient.subscribe.mockResolvedValue(() => {});

		const result = await fake.call(SOCKETIO_MPD_SUBSCRIBE, profileBytes);

		expect(result).toBeUndefined();
		expect(mpdClient.subscribe).toHaveBeenCalledWith(
			expect.objectContaining({ host: "localhost", port: 6600 }),
			expect.any(Function),
		);
	});

	it("rejects when subscribing fails", async () => {
		const err = new Error("MPD is down");
		mpdClient.subscribe.mockRejectedValue(err);

		await expect(fake.call(SOCKETIO_MPD_SUBSCRIBE, profileBytes)).rejects.toBe(
			err,
		);
	});

	it("rejects when unsubscribing fails", async () => {
		const err = new Error("unsubscribe boom");
		mpdClient.subscribe.mockResolvedValue(() => {});
		mpdClient.unsubscribe.mockRejectedValue(err);
		const { peer } = fake.createPeer("p1");
		await fake.call(SOCKETIO_MPD_SUBSCRIBE, profileBytes, peer);

		await expect(
			fake.call(SOCKETIO_MPD_UNSUBSCRIBE, profileBytes, peer),
		).rejects.toBe(err);
	});

	it("releases the peer's subscriptions on disconnect", async () => {
		mpdClient.subscribe.mockResolvedValue(() => {});
		mpdClient.unsubscribe.mockResolvedValue(true);
		const { peer } = fake.createPeer("p1");
		await fake.call(SOCKETIO_MPD_SUBSCRIBE, profileBytes, peer);

		await fake.disconnect(peer);

		expect(mpdClient.unsubscribe).toHaveBeenCalledTimes(1);
	});
});
