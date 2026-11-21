import { toBinary } from "@bufbuild/protobuf";
import { SOCKETIO_MPD_EVENT } from "@sola_mpd/shared/src/const/socketio.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { DeepMap } from "@sola_mpd/shared/src/utils/DeepMap.js";
import type { MessagingPeer } from "../../lib/messaging/MessagingServer.js";
import {
	disconnectMpdEventsUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
} from "../application/mpdUseCases.js";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";

export class MpdEventSubscriptions {
	private readonly entries = new DeepMap<
		[string, MpdProfile],
		Promise<MpdSubscriptionHandler>
	>();

	constructor(private readonly mpdClient: MpdClient) {}

	async subscribe(peer: MessagingPeer, profile: MpdProfile): Promise<void> {
		const key: [string, MpdProfile] = [peer.id, profile];
		const existing = this.entries.get(key);
		if (existing !== undefined) {
			await existing;
			return;
		}

		const handlerPromise = subscribeMpdEventsUseCase({
			profile,
			onEvent: (event) => {
				peer.send(SOCKETIO_MPD_EVENT, toBinary(MpdEventSchema, event));
				if (event.eventType === MpdEvent_EventType.DISCONNECTED) {
					this.entries.delete(key);
				}
			},
			mpdClient: this.mpdClient,
		}).then(({ handlerPromise: innerPromise }) => innerPromise);

		// Stored before it settles so a concurrent subscribe finds it (#425).
		this.entries.set(key, handlerPromise);
		try {
			await handlerPromise;
		} catch (err) {
			if (this.entries.get(key) === handlerPromise) {
				this.entries.delete(key);
			}
			throw err;
		}
		console.info(
			`New client registered: ${peer.id} for ${profile.host}:${profile.port}`,
		);
	}

	async unsubscribe(peerId: string, profile: MpdProfile): Promise<void> {
		const handlerPromise = this.entries.get([peerId, profile]);
		if (handlerPromise === undefined) {
			return;
		}

		const unsubscribed = await unsubscribeMpdEventsUseCase({
			profile,
			handlerPromise,
			mpdClient: this.mpdClient,
		});
		if (unsubscribed !== undefined) {
			this.entries.delete([peerId, unsubscribed]);
			console.info(`${peerId}.${unsubscribed.name} has been unsubscribed.`);
		}
	}

	async disconnect(peerId: string): Promise<void> {
		const owned = Array.from(this.entries).filter(
			([[keyId]]) => keyId === peerId,
		);
		for (const [key, handlerPromise] of owned) {
			const [, profile] = key;
			this.entries.delete(key);
			try {
				await disconnectMpdEventsUseCase({
					profile,
					handlerPromise,
					mpdClient: this.mpdClient,
				});
			} catch (err) {
				console.error(err);
			}
		}
	}
}
