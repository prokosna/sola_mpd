import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	MpdRequestBulkSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it, vi } from "vitest";
import type {
	MpdClientPort,
	MpdSubscriptionHandler,
} from "../services/MpdClientPort.js";
import {
	disconnectMpdEventsUseCase,
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
} from "./mpdUseCases.js";

const createProfile = () => {
	return create(MpdProfileSchema, {
		name: "default",
		host: "localhost",
		port: 6600,
		password: "",
	});
};

const createCommandMessage = () => {
	const request = create(MpdRequestSchema, {
		profile: createProfile(),
		command: {
			case: "ping",
			value: {},
		},
	});
	return new Uint8Array(toBinary(MpdRequestSchema, request));
};

const createProfileMessage = () => {
	return new Uint8Array(toBinary(MpdProfileSchema, createProfile()));
};

const createMpdClientPort = (
	overrides?: Partial<MpdClientPort>,
): MpdClientPort => {
	return {
		execute: vi.fn(),
		executeBulk: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		...overrides,
	};
};

describe("mpdUseCases", () => {
	it("executeMpdCommandUseCase decodes request and encodes response", async () => {
		const response = create(MpdResponseSchema, {
			command: {
				case: "ping",
				value: { version: "0.24.0" },
			},
		});
		const mpdClientPort = createMpdClientPort({
			execute: vi.fn().mockResolvedValue(response),
		});

		const result = await executeMpdCommandUseCase(
			createCommandMessage(),
			mpdClientPort,
		);

		expect(mpdClientPort.execute).toHaveBeenCalledTimes(1);
		const decoded = fromBinary(MpdResponseSchema, result);
		expect(decoded).toMatchObject({
			command: {
				case: "ping",
				value: {
					version: "0.24.0",
				},
			},
		});
	});

	it("executeMpdCommandUseCase propagates client errors", async () => {
		const expected = new Error("execute failed");
		const mpdClientPort = createMpdClientPort({
			execute: vi.fn().mockRejectedValue(expected),
		});

		await expect(
			executeMpdCommandUseCase(createCommandMessage(), mpdClientPort),
		).rejects.toThrow("execute failed");
	});

	it("executeMpdCommandBulkUseCase delegates bulk requests", async () => {
		const request = create(MpdRequestSchema, {
			profile: createProfile(),
			command: {
				case: "ping",
				value: {},
			},
		});
		const msg = new Uint8Array(
			toBinary(
				MpdRequestBulkSchema,
				create(MpdRequestBulkSchema, {
					requests: [request],
				}),
			),
		);
		const mpdClientPort = createMpdClientPort({
			executeBulk: vi.fn().mockResolvedValue(undefined),
		});

		await executeMpdCommandBulkUseCase(msg, mpdClientPort);

		expect(mpdClientPort.executeBulk).toHaveBeenCalledTimes(1);
		expect(mpdClientPort.executeBulk).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					command: expect.objectContaining({ case: "ping" }),
				}),
			]),
		);
	});

	it("subscribeMpdEventsUseCase returns profile and handler promise", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		const event = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.PLAYER,
		});
		const mpdClientPort = createMpdClientPort({
			subscribe: vi.fn().mockImplementation(async (_profile, callback) => {
				callback(event);
				return handler;
			}),
		});
		const onEvent = vi.fn();

		const result = await subscribeMpdEventsUseCase({
			msg: createProfileMessage(),
			onEvent,
			mpdClientPort,
		});

		expect(result.profile).toMatchObject({
			name: "default",
			host: "localhost",
			port: 6600,
		});
		expect(result.handlerPromise).toBeInstanceOf(Promise);
		expect(onEvent).toHaveBeenCalledWith(event);
	});

	it("subscribeMpdEventsUseCase propagates subscribe errors", async () => {
		const mpdClientPort = createMpdClientPort();
		const onEvent = vi.fn();
		const expected = new Error("subscribe failed");
		mpdClientPort.subscribe = vi.fn().mockRejectedValue(expected);

		const result = await subscribeMpdEventsUseCase({
			msg: createProfileMessage(),
			onEvent,
			mpdClientPort,
		});

		await expect(result.handlerPromise).rejects.toThrow("subscribe failed");
	});

	it("unsubscribeMpdEventsUseCase returns undefined when handler is missing", async () => {
		const mpdClientPort = createMpdClientPort();

		const result = await unsubscribeMpdEventsUseCase({
			msg: createProfileMessage(),
			handlerPromise: undefined,
			mpdClientPort,
		});

		expect(result).toBeUndefined();
		expect(mpdClientPort.unsubscribe).not.toHaveBeenCalled();
	});

	it("unsubscribeMpdEventsUseCase unsubscribes and returns profile", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		const mpdClientPort = createMpdClientPort({
			unsubscribe: vi.fn().mockResolvedValue(true),
		});

		const result = await unsubscribeMpdEventsUseCase({
			msg: createProfileMessage(),
			handlerPromise: Promise.resolve(handler),
			mpdClientPort,
		});

		expect(result).toMatchObject({
			name: "default",
			host: "localhost",
			port: 6600,
		});
		expect(mpdClientPort.unsubscribe).toHaveBeenCalledTimes(1);
	});

	it("disconnectMpdEventsUseCase unsubscribes one profile handler", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		const profile = create(MpdProfileSchema, {
			name: "default",
			host: "localhost",
			port: 6600,
			password: "",
		});
		const mpdClientPort = createMpdClientPort({
			unsubscribe: vi.fn().mockResolvedValue(true),
		});

		await disconnectMpdEventsUseCase({
			profile,
			handlerPromise: Promise.resolve(handler),
			mpdClientPort,
		});

		expect(mpdClientPort.unsubscribe).toHaveBeenCalledTimes(1);
		expect(mpdClientPort.unsubscribe).toHaveBeenCalledWith(profile, handler);
	});
});
