import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MPD_EVENT,
	SOCKETIO_MPD_SUBSCRIBE,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { MpdListenerSocketIo } from "./MpdListenerSocketIo";

class FakeMessagingClient implements MessagingClient {
	emitted: { event: string; profileName: string }[] = [];
	listeners = new Map<string, (message: Uint8Array) => void>();
	reconnectCallbacks: (() => void)[] = [];

	isReady = async () => true;
	fetch = async <R>(): Promise<R> => {
		throw new Error("unused");
	};
	emit = async (event: string, payload: Uint8Array) => {
		this.emitted.push({
			event,
			profileName: fromBinary(MpdProfileSchema, payload).name,
		});
		return new Uint8Array(0);
	};
	on = async (event: string, callback: (message: Uint8Array) => void) => {
		this.listeners.set(event, callback);
	};
	off = async (event: string) => {
		this.listeners.delete(event);
	};
	onReconnect = (callback: () => void) => {
		this.reconnectCallbacks.push(callback);
	};

	reconnect() {
		for (const callback of this.reconnectCallbacks) {
			callback();
		}
	}

	push(eventType: MpdEvent_EventType) {
		this.listeners.get(SOCKETIO_MPD_EVENT)?.(
			toBinary(MpdEventSchema, create(MpdEventSchema, { eventType })),
		);
	}
}

const profileA = create(MpdProfileSchema, { name: "A", host: "a", port: 1 });
const profileB = create(MpdProfileSchema, { name: "B", host: "b", port: 2 });

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("MpdListenerSocketIo", () => {
	let client: FakeMessagingClient;
	let listener: MpdListenerSocketIo;

	beforeEach(() => {
		vi.spyOn(console, "info").mockImplementation(() => {});
		client = new FakeMessagingClient();
		listener = new MpdListenerSocketIo(client);
	});

	it("should dispatch events to the registered callback", async () => {
		const onPlayer = vi.fn();
		listener.on(MpdEvent_EventType.PLAYER, onPlayer);
		listener.subscribe(profileA);
		await flush();

		client.push(MpdEvent_EventType.PLAYER);

		expect(onPlayer).toHaveBeenCalledTimes(1);
	});

	it("should notify once the subscription is acknowledged", async () => {
		const onSubscribed = vi.fn();
		listener.onSubscribed(onSubscribed);

		listener.subscribe(profileA);
		expect(onSubscribed).not.toHaveBeenCalled();
		await flush();

		expect(onSubscribed).toHaveBeenCalledWith(false);
	});

	it("should re-subscribe the current profile after a reconnect", async () => {
		const onSubscribed = vi.fn();
		listener.onSubscribed(onSubscribed);
		listener.subscribe(profileA);
		await flush();

		client.reconnect();
		await flush();

		expect(client.emitted).toEqual([
			{ event: SOCKETIO_MPD_SUBSCRIBE, profileName: "A" },
			{ event: SOCKETIO_MPD_SUBSCRIBE, profileName: "A" },
		]);
		expect(onSubscribed.mock.calls).toEqual([[false], [true]]);
	});

	it("should re-subscribe only the latest profile after switching", async () => {
		listener.subscribe(profileA);
		listener.unsubscribe(profileA);
		listener.subscribe(profileB);
		await flush();
		client.emitted = [];

		client.reconnect();
		await flush();

		expect(client.emitted).toEqual([
			{ event: SOCKETIO_MPD_SUBSCRIBE, profileName: "B" },
		]);
	});

	it("should not notify for a profile switched away from", async () => {
		const onSubscribed = vi.fn();
		listener.onSubscribed(onSubscribed);

		listener.subscribe(profileA);
		listener.unsubscribe(profileA);
		await flush();

		expect(onSubscribed).not.toHaveBeenCalled();
	});

	it("should not re-subscribe after unsubscribing", async () => {
		listener.subscribe(profileA);
		listener.unsubscribe(profileA);
		await flush();
		client.emitted = [];

		client.reconnect();
		await flush();

		expect(client.emitted).toEqual([]);
	});
});
