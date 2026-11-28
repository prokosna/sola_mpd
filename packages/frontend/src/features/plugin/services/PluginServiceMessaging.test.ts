import { create, toBinary } from "@bufbuild/protobuf";
import {
	PluginExecuteRequestSchema,
	PluginExecuteResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	type PluginExecuteResponseWrapper,
	PluginExecuteResponseWrapperSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_wrapper_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { PluginServiceMessaging } from "./PluginServiceMessaging";

const createClient = () => {
	const listeners = new Map<string, (data: Uint8Array) => void>();
	const disconnectListeners = new Set<() => void>();
	const client: MessagingClient = {
		isReady: vi.fn(),
		fetch: vi.fn(),
		emit: vi.fn(async () => new Uint8Array(0)),
		on: vi.fn(async (event, callback) => {
			listeners.set(event, callback);
		}),
		off: vi.fn(async (event) => {
			listeners.delete(event);
		}),
		onReconnect: vi.fn(),
		onDisconnect: vi.fn((callback) => {
			disconnectListeners.add(callback);
			return () => disconnectListeners.delete(callback);
		}),
	};
	return { client, listeners, disconnectListeners };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const request = create(PluginExecuteRequestSchema);

describe("PluginServiceMessaging.execute", () => {
	it("removes the callback listener when the consumer unsubscribes early", async () => {
		const { client, listeners, disconnectListeners } = createClient();
		const subscription = new PluginServiceMessaging(client)
			.execute(request)
			.subscribe();
		await flush();
		expect(listeners.size).toBe(1);

		subscription.unsubscribe();

		expect(listeners.size).toBe(0);
		expect(disconnectListeners.size).toBe(0);
	});

	it("removes the listener when unsubscribed before it is registered", async () => {
		const { client, listeners } = createClient();
		new PluginServiceMessaging(client)
			.execute(request)
			.subscribe()
			.unsubscribe();
		await flush();

		expect(listeners.size).toBe(0);
		expect(client.emit).not.toHaveBeenCalled();
	});

	it("errors the stream and removes the listener on disconnect", async () => {
		const { client, listeners, disconnectListeners } = createClient();
		const error = vi.fn();
		new PluginServiceMessaging(client).execute(request).subscribe({ error });
		await flush();

		for (const callback of disconnectListeners) {
			callback();
		}

		expect(error).toHaveBeenCalledOnce();
		expect(listeners.size).toBe(0);
		expect(disconnectListeners.size).toBe(0);
	});

	it("emits responses and cleans up on complete", async () => {
		const { client, listeners } = createClient();
		const next = vi.fn();
		const complete = vi.fn();
		new PluginServiceMessaging(client)
			.execute(request)
			.subscribe({ next, complete });
		await flush();

		const send = (result: PluginExecuteResponseWrapper["result"]) => {
			const listener = [...listeners.values()][0];
			listener(
				toBinary(
					PluginExecuteResponseWrapperSchema,
					create(PluginExecuteResponseWrapperSchema, { result }),
				),
			);
		};
		send({
			case: "response",
			value: create(PluginExecuteResponseSchema, { message: "hi" }),
		});
		send({ case: "complete", value: true });

		expect(next).toHaveBeenCalledOnce();
		expect(complete).toHaveBeenCalledOnce();
		expect(listeners.size).toBe(0);
	});
});
