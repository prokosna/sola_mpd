import { create } from "@bufbuild/protobuf";
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
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";
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

const createCommandRequest = () => {
	return create(MpdRequestSchema, {
		profile: createProfile(),
		command: {
			case: "ping",
			value: {},
		},
	});
};

const createMpdClient = (overrides?: Partial<MpdClient>): MpdClient => {
	return {
		execute: vi.fn(),
		executeBulk: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		...overrides,
	};
};

describe("mpdUseCases", () => {
	it("executeMpdCommandUseCase returns the client response", async () => {
		const response = create(MpdResponseSchema, {
			command: {
				case: "ping",
				value: { version: "0.24.0" },
			},
		});
		const mpdClient = createMpdClient({
			execute: vi.fn().mockResolvedValue(response),
		});

		const request = createCommandRequest();

		const result = await executeMpdCommandUseCase(request, mpdClient);

		expect(mpdClient.execute).toHaveBeenCalledWith(request);
		expect(result).toBe(response);
	});

	it("executeMpdCommandUseCase propagates client errors", async () => {
		const expected = new Error("execute failed");
		const mpdClient = createMpdClient({
			execute: vi.fn().mockRejectedValue(expected),
		});

		await expect(
			executeMpdCommandUseCase(createCommandRequest(), mpdClient),
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
		const bulk = create(MpdRequestBulkSchema, { requests: [request] });
		const mpdClient = createMpdClient({
			executeBulk: vi.fn().mockResolvedValue(undefined),
		});

		await executeMpdCommandBulkUseCase(bulk, mpdClient);

		expect(mpdClient.executeBulk).toHaveBeenCalledTimes(1);
		expect(mpdClient.executeBulk).toHaveBeenCalledWith(
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
		const mpdClient = createMpdClient({
			subscribe: vi.fn().mockImplementation(async (_profile, callback) => {
				callback(event);
				return handler;
			}),
		});
		const onEvent = vi.fn();

		const result = await subscribeMpdEventsUseCase({
			profile: createProfile(),
			onEvent,
			mpdClient: mpdClient,
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
		const mpdClient = createMpdClient();
		const onEvent = vi.fn();
		const expected = new Error("subscribe failed");
		mpdClient.subscribe = vi.fn().mockRejectedValue(expected);

		const result = await subscribeMpdEventsUseCase({
			profile: createProfile(),
			onEvent,
			mpdClient: mpdClient,
		});

		await expect(result.handlerPromise).rejects.toThrow("subscribe failed");
	});

	it("unsubscribeMpdEventsUseCase returns undefined when handler is missing", async () => {
		const mpdClient = createMpdClient();

		const result = await unsubscribeMpdEventsUseCase({
			profile: createProfile(),
			handlerPromise: undefined,
			mpdClient: mpdClient,
		});

		expect(result).toBeUndefined();
		expect(mpdClient.unsubscribe).not.toHaveBeenCalled();
	});

	it("unsubscribeMpdEventsUseCase unsubscribes and returns profile", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		const mpdClient = createMpdClient({
			unsubscribe: vi.fn().mockResolvedValue(true),
		});

		const result = await unsubscribeMpdEventsUseCase({
			profile: createProfile(),
			handlerPromise: Promise.resolve(handler),
			mpdClient: mpdClient,
		});

		expect(result).toMatchObject({
			name: "default",
			host: "localhost",
			port: 6600,
		});
		expect(mpdClient.unsubscribe).toHaveBeenCalledTimes(1);
	});

	it("disconnectMpdEventsUseCase unsubscribes one profile handler", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		const profile = create(MpdProfileSchema, {
			name: "default",
			host: "localhost",
			port: 6600,
			password: "",
		});
		const mpdClient = createMpdClient({
			unsubscribe: vi.fn().mockResolvedValue(true),
		});

		await disconnectMpdEventsUseCase({
			profile,
			handlerPromise: Promise.resolve(handler),
			mpdClient: mpdClient,
		});

		expect(mpdClient.unsubscribe).toHaveBeenCalledTimes(1);
		expect(mpdClient.unsubscribe).toHaveBeenCalledWith(profile, handler);
	});
});
