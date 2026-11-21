import { create, toBinary } from "@bufbuild/protobuf";
import {
	type MpdEvent,
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";

const subscribe =
	vi.fn<
		(
			profile: unknown,
			callback: (event: MpdEvent) => void,
		) => Promise<MpdSubscriptionHandler>
	>();
const unsubscribe = vi.fn(async () => true);

const { MpdMessageHandlerSocketIo } = await import(
	"./MpdMessageHandlerSocketIo.js"
);

const msg = toBinary(
	MpdProfileSchema,
	create(MpdProfileSchema, { name: "default", host: "localhost", port: 6600 }),
);

const createConnection = () => ({
	emit: vi.fn(),
});

describe("MpdMessageHandlerSocketIo", () => {
	let handler: ReturnType<typeof MpdMessageHandlerSocketIo.initialize>;

	beforeEach(() => {
		subscribe.mockReset();
		unsubscribe.mockClear();
		vi.spyOn(console, "info").mockImplementation(() => {});
		handler = MpdMessageHandlerSocketIo.initialize({
			subscribe,
			unsubscribe,
		} as unknown as MpdClient);
	});

	it("does not subscribe twice for the same client and profile", async () => {
		subscribe.mockResolvedValue(() => {});
		const connection = createConnection();

		await handler.subscribeEvents("id", msg, connection);
		await handler.subscribeEvents("id", msg, connection);

		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("forwards DISCONNECTED and lets the client subscribe again", async () => {
		let onEvent: (event: MpdEvent) => void = () => {};
		subscribe.mockImplementation(async (_, callback) => {
			onEvent = callback;
			return () => {};
		});
		const connection = createConnection();
		await handler.subscribeEvents("id", msg, connection);

		const disconnected = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.DISCONNECTED,
		});
		onEvent(disconnected);

		expect(connection.emit).toHaveBeenCalledWith(
			expect.any(String),
			toBinary(MpdEventSchema, disconnected),
		);

		await handler.subscribeEvents("id", msg, connection);
		expect(subscribe).toHaveBeenCalledTimes(2);
	});

	it("rejects a failed subscription and allows a retry", async () => {
		subscribe.mockRejectedValueOnce(new Error("MPD is down"));
		subscribe.mockResolvedValueOnce(() => {});
		const connection = createConnection();

		await expect(
			handler.subscribeEvents("id", msg, connection),
		).rejects.toThrow("MPD is down");

		await handler.subscribeEvents("id", msg, connection);
		expect(subscribe).toHaveBeenCalledTimes(2);
	});

	it("reports the outcome of an in-flight subscription to a duplicate request", async () => {
		let fail: (err: Error) => void = () => {};
		subscribe.mockReturnValueOnce(
			new Promise((_, reject) => {
				fail = reject;
			}),
		);
		const connection = createConnection();

		const first = handler.subscribeEvents("id", msg, connection);
		await new Promise((resolve) => setTimeout(resolve, 0));
		const second = handler.subscribeEvents("id", msg, connection);
		fail(new Error("MPD is down"));

		await expect(first).rejects.toThrow("MPD is down");
		await expect(second).rejects.toThrow("MPD is down");
		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("deduplicates concurrent subscribe calls in the same tick", async () => {
		subscribe.mockResolvedValue(() => {});
		const connection = createConnection();

		await Promise.all([
			handler.subscribeEvents("id", msg, connection),
			handler.subscribeEvents("id", msg, connection),
		]);

		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("delivers events only to the subscribed connection instead of broadcasting to the room", async () => {
		const callbacks: Array<(event: MpdEvent) => void> = [];
		subscribe.mockImplementation(async (_, callback) => {
			callbacks.push(callback);
			return () => {};
		});
		const conn1 = createConnection();
		const conn2 = createConnection();

		await handler.subscribeEvents("client-1", msg, conn1);
		await handler.subscribeEvents("client-2", msg, conn2);

		const update = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.PLAYER,
		});
		for (const cb of callbacks) {
			cb(update);
		}

		expect(conn1.emit).toHaveBeenCalledTimes(1);
		expect(conn2.emit).toHaveBeenCalledTimes(1);
	});

	it("cleans up remaining subscriptions in disconnect even if one fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const msg2 = toBinary(
			MpdProfileSchema,
			create(MpdProfileSchema, {
				name: "second",
				host: "localhost",
				port: 6601,
			}),
		);
		subscribe
			.mockRejectedValueOnce(new Error("first failed"))
			.mockResolvedValueOnce(() => {});
		const connection = createConnection();

		const first = handler.subscribeEvents("id", msg, connection);
		await handler.subscribeEvents("id", msg2, connection);
		await expect(first).rejects.toThrow("first failed");

		await handler.disconnect("id", connection);
		expect(unsubscribe).toHaveBeenCalledTimes(1);
		errorSpy.mockRestore();
	});
});
