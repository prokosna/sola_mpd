import { create, toBinary } from "@bufbuild/protobuf";
import {
	type MpdEvent,
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Server as IOServer } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MpdSubscriptionHandler } from "../services/MpdClient.js";

const subscribe =
	vi.fn<
		(
			profile: unknown,
			callback: (event: MpdEvent) => void,
		) => Promise<MpdSubscriptionHandler>
	>();
const unsubscribe = vi.fn(async () => true);

vi.mock("../services/MpdClientMpd3.js", () => ({
	mpdClientMpd3: { subscribe, unsubscribe },
}));

const { MpdMessageHandlerSocketIo } = await import(
	"./MpdMessageHandlerSocketIo.js"
);

const msg = toBinary(
	MpdProfileSchema,
	create(MpdProfileSchema, { name: "default", host: "localhost", port: 6600 }),
);

const createConnection = () => ({
	join: vi.fn(),
	leave: vi.fn(),
	emit: vi.fn(),
});

describe("MpdMessageHandlerSocketIo", () => {
	let roomEmit: ReturnType<typeof vi.fn>;
	let handler: InstanceType<typeof MpdMessageHandlerSocketIo>;

	beforeEach(() => {
		subscribe.mockReset();
		unsubscribe.mockClear();
		vi.spyOn(console, "info").mockImplementation(() => {});
		roomEmit = vi.fn();
		const io = { to: () => ({ emit: roomEmit }) } as unknown as IOServer;
		handler = MpdMessageHandlerSocketIo.initialize(io);
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

		expect(roomEmit).toHaveBeenCalledWith(
			expect.any(String),
			toBinary(MpdEventSchema, disconnected),
		);
		expect(connection.leave).toHaveBeenCalledWith("localhost:6600");

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
		expect(connection.leave).toHaveBeenCalledWith("localhost:6600");

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
});
