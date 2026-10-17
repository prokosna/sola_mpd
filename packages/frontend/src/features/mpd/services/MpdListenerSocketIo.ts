import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MPD_EVENT,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import type { MpdListener } from "./MpdListener";

export class MpdListenerSocketIo implements MpdListener {
	private socket: MessagingClient;
	private callbacks: Map<MpdEvent_EventType, () => void>;
	private subscribedCallback: ((isResubscription: boolean) => void) | undefined;
	private subscribedProfile: MpdProfile | undefined;

	constructor(messagingClient: MessagingClient) {
		this.socket = messagingClient;
		this.callbacks = new Map();
		this.socket.onReconnect(() => {
			if (this.subscribedProfile !== undefined) {
				this.requestSubscription(this.subscribedProfile, true);
			}
		});
	}

	subscribe = (profile: MpdProfile): void => {
		this.subscribedProfile = profile;
		this.socket.on(SOCKETIO_MPD_EVENT, (msg: Uint8Array) => {
			const event = fromBinary(MpdEventSchema, msg);
			console.info(`MPD event: ${MpdEvent_EventType[event.eventType]}`);
			this.callbacks.get(event.eventType)?.();
		});
		this.requestSubscription(profile, false);
	};

	unsubscribe = (profile: MpdProfile): void => {
		this.subscribedProfile = undefined;
		this.socket.off(SOCKETIO_MPD_EVENT);
		this.socket.emit(
			SOCKETIO_MPD_UNSUBSCRIBE,
			toBinary(MpdProfileSchema, profile),
		);
	};

	on = (event: MpdEvent_EventType, callback: () => void): void => {
		this.callbacks.set(event, callback);
	};

	off = (event: MpdEvent_EventType): void => {
		this.callbacks.delete(event);
	};

	onSubscribed = (callback: (isResubscription: boolean) => void): void => {
		this.subscribedCallback = callback;
	};

	private requestSubscription(
		profile: MpdProfile,
		isResubscription: boolean,
	): void {
		this.socket
			.emit(SOCKETIO_MPD_SUBSCRIBE, toBinary(MpdProfileSchema, profile))
			.then(() => {
				// A late ack for a profile switched away from must not trigger a
				// refetch on its behalf.
				if (this.subscribedProfile === profile) {
					this.subscribedCallback?.(isResubscription);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}
}
