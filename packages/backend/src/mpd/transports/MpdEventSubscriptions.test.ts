import { create, toBinary } from "@bufbuild/protobuf";
import { SOCKETIO_MPD_EVENT } from "@sola_mpd/shared/src/const/socketio.js";
import {
	type MpdEvent,
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MessagingPeer } from "../../lib/messaging/MessagingServer.js";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";
import { MpdEventSubscriptions } from "./MpdEventSubscriptions.js";

const profile = create(MpdProfileSchema, {
	name: "default",
	host: "localhost",
	port: 6600,
});
const otherProfile = create(MpdProfileSchema, {
	name: "second",
	host: "localhost",
	port: 6601,
});

const createPeer = (id: string) => {
	const send = vi.fn<(channel: string, payload: Uint8Array) => void>();
	const peer: MessagingPeer = { id, send };
	return { peer, send };
};

describe("MpdEventSubscriptions", () => {
	const subscribe =
		vi.fn<
			(
				profile: unknown,
				callback: (event: MpdEvent) => void,
			) => Promise<MpdSubscriptionHandler>
		>();
	const unsubscribe = vi.fn(async () => true);
	let subscriptions: MpdEventSubscriptions;

	beforeEach(() => {
		subscribe.mockReset();
		unsubscribe.mockClear();
		vi.spyOn(console, "info").mockImplementation(() => {});
		subscriptions = new MpdEventSubscriptions({
			subscribe,
			unsubscribe,
		} as unknown as MpdClient);
	});

	it("does not subscribe twice for the same peer and profile", async () => {
		subscribe.mockResolvedValue(() => {});
		const { peer } = createPeer("p1");

		await subscriptions.subscribe(peer, profile);
		await subscriptions.subscribe(peer, profile);

		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	// Regression: #425 — the entry must exist before the subscription settles.
	it("deduplicates concurrent subscribe calls in the same tick", async () => {
		subscribe.mockResolvedValue(() => {});
		const { peer } = createPeer("p1");

		await Promise.all([
			subscriptions.subscribe(peer, profile),
			subscriptions.subscribe(peer, profile),
		]);

		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("reports the outcome of an in-flight subscription to a duplicate request", async () => {
		let fail: (err: Error) => void = () => {};
		subscribe.mockReturnValueOnce(
			new Promise((_, reject) => {
				fail = reject;
			}),
		);
		const { peer } = createPeer("p1");

		const first = subscriptions.subscribe(peer, profile);
		await new Promise((resolve) => setTimeout(resolve, 0));
		const second = subscriptions.subscribe(peer, profile);
		fail(new Error("MPD is down"));

		await expect(first).rejects.toThrow("MPD is down");
		await expect(second).rejects.toThrow("MPD is down");
		expect(subscribe).toHaveBeenCalledTimes(1);
	});

	it("rejects a failed subscription and allows a retry", async () => {
		subscribe.mockRejectedValueOnce(new Error("MPD is down"));
		subscribe.mockResolvedValueOnce(() => {});
		const { peer } = createPeer("p1");

		await expect(subscriptions.subscribe(peer, profile)).rejects.toThrow(
			"MPD is down",
		);
		await subscriptions.subscribe(peer, profile);

		expect(subscribe).toHaveBeenCalledTimes(2);
	});

	it("sends events to the subscribing peer on the MPD event channel", async () => {
		let onEvent: (event: MpdEvent) => void = () => {};
		subscribe.mockImplementation(async (_, callback) => {
			onEvent = callback;
			return () => {};
		});
		const { peer, send } = createPeer("p1");
		await subscriptions.subscribe(peer, profile);

		const update = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.PLAYER,
		});
		onEvent(update);

		expect(send).toHaveBeenCalledWith(
			SOCKETIO_MPD_EVENT,
			toBinary(MpdEventSchema, update),
		);
	});

	it("delivers each subscription's events only to its own peer", async () => {
		const callbacks: Array<(event: MpdEvent) => void> = [];
		subscribe.mockImplementation(async (_, callback) => {
			callbacks.push(callback);
			return () => {};
		});
		const a = createPeer("a");
		const b = createPeer("b");
		await subscriptions.subscribe(a.peer, profile);
		await subscriptions.subscribe(b.peer, profile);

		callbacks[0](
			create(MpdEventSchema, { eventType: MpdEvent_EventType.PLAYER }),
		);

		expect(a.send).toHaveBeenCalledTimes(1);
		expect(b.send).not.toHaveBeenCalled();
	});

	it("forwards DISCONNECTED and lets the peer subscribe again", async () => {
		let onEvent: (event: MpdEvent) => void = () => {};
		subscribe.mockImplementation(async (_, callback) => {
			onEvent = callback;
			return () => {};
		});
		const { peer, send } = createPeer("p1");
		await subscriptions.subscribe(peer, profile);

		const disconnected = create(MpdEventSchema, {
			eventType: MpdEvent_EventType.DISCONNECTED,
		});
		onEvent(disconnected);

		expect(send).toHaveBeenCalledWith(
			SOCKETIO_MPD_EVENT,
			toBinary(MpdEventSchema, disconnected),
		);
		await subscriptions.subscribe(peer, profile);
		expect(subscribe).toHaveBeenCalledTimes(2);
	});

	it("unsubscribes a known subscription and allows subscribing again", async () => {
		const handler: MpdSubscriptionHandler = () => {};
		subscribe.mockResolvedValue(handler);
		const { peer } = createPeer("p1");
		await subscriptions.subscribe(peer, profile);

		await subscriptions.unsubscribe(peer.id, profile);

		expect(unsubscribe).toHaveBeenCalledWith(profile, handler);
		await subscriptions.subscribe(peer, profile);
		expect(subscribe).toHaveBeenCalledTimes(2);
	});

	// Regression: a subscribe during a pending unsubscribe must not be torn down with it.
	it("creates a live subscription when subscribe arrives during a pending unsubscribe", async () => {
		const first: MpdSubscriptionHandler = () => {};
		const second: MpdSubscriptionHandler = () => {};
		subscribe.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
		let finishUnsubscribe: () => void = () => {};
		unsubscribe.mockImplementationOnce(
			() =>
				new Promise<boolean>((resolve) => {
					finishUnsubscribe = () => resolve(true);
				}),
		);
		const { peer } = createPeer("p1");
		await subscriptions.subscribe(peer, profile);

		const pending = subscriptions.unsubscribe(peer.id, profile);
		await subscriptions.subscribe(peer, profile);
		finishUnsubscribe();
		await pending;

		expect(subscribe).toHaveBeenCalledTimes(2);
		expect(unsubscribe).toHaveBeenCalledTimes(1);
		expect(unsubscribe).toHaveBeenCalledWith(profile, first);
		await subscriptions.unsubscribe(peer.id, profile);
		expect(unsubscribe).toHaveBeenLastCalledWith(profile, second);
	});

	it("ignores an unsubscribe for a subscription it does not hold", async () => {
		await subscriptions.unsubscribe("p1", profile);

		expect(unsubscribe).not.toHaveBeenCalled();
	});

	it("disconnect releases only that peer's subscriptions", async () => {
		subscribe.mockResolvedValue(() => {});
		const a = createPeer("a");
		const b = createPeer("b");
		await subscriptions.subscribe(a.peer, profile);
		await subscriptions.subscribe(a.peer, otherProfile);
		await subscriptions.subscribe(b.peer, profile);

		await subscriptions.disconnect("a");

		expect(unsubscribe).toHaveBeenCalledTimes(2);
		await subscriptions.subscribe(b.peer, profile);
		expect(subscribe).toHaveBeenCalledTimes(3);
		await subscriptions.subscribe(a.peer, profile);
		expect(subscribe).toHaveBeenCalledTimes(4);
	});

	it("disconnect continues past a subscription that failed", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		subscribe
			.mockRejectedValueOnce(new Error("first failed"))
			.mockResolvedValueOnce(() => {});
		const { peer } = createPeer("p1");

		const first = subscriptions.subscribe(peer, profile);
		await subscriptions.subscribe(peer, otherProfile);
		await expect(first).rejects.toThrow("first failed");

		await subscriptions.disconnect(peer.id);

		expect(unsubscribe).toHaveBeenCalledTimes(1);
		errorSpy.mockRestore();
	});
});
