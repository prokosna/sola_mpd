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
import { getResubscribeDelayMs } from "../functions/resubscribeBackoff";
import { getSubscribeAckError } from "../functions/subscribeAck";
import type { MpdListener } from "./MpdListener";

export class MpdListenerSocketIo implements MpdListener {
	private socket: MessagingClient;
	private callbacks: Map<MpdEvent_EventType, () => void>;
	private subscribedCallback: ((isResubscription: boolean) => void) | undefined;
	private subscribedProfile: MpdProfile | undefined;
	private isRecovering = false;
	private retryAttempt = 0;
	private retryTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(messagingClient: MessagingClient) {
		this.socket = messagingClient;
		this.callbacks = new Map();
		this.socket.onReconnect(() => {
			if (this.subscribedProfile !== undefined) {
				this.resetRecovery();
				this.requestSubscription(this.subscribedProfile, true);
			}
		});
	}

	subscribe = (profile: MpdProfile): void => {
		this.resetRecovery();
		this.subscribedProfile = profile;
		this.socket.on(SOCKETIO_MPD_EVENT, (msg: Uint8Array) => {
			const event = fromBinary(MpdEventSchema, msg);
			console.info(`MPD event: ${MpdEvent_EventType[event.eventType]}`);
			if (event.eventType === MpdEvent_EventType.DISCONNECTED) {
				this.recover();
			}
			this.callbacks.get(event.eventType)?.();
		});
		this.requestSubscription(profile, false);
	};

	unsubscribe = (profile: MpdProfile): void => {
		this.resetRecovery();
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
			.then((ack) => {
				const error = getSubscribeAckError(ack);
				if (error !== undefined) {
					throw new Error(error);
				}
				// A late ack for a profile switched away from must not trigger a
				// refetch on its behalf.
				if (this.subscribedProfile === profile) {
					this.resetRecovery();
					this.subscribedCallback?.(isResubscription);
				}
			})
			.catch((err) => {
				console.error(err);
				if (this.subscribedProfile === profile) {
					this.isRecovering = true;
					this.scheduleRetry(profile);
				}
			});
	}

	// The backend has already dropped the dead subscription; the unsubscribe
	// only guards against one that outlived it.
	private recover(): void {
		const profile = this.subscribedProfile;
		if (profile === undefined || this.isRecovering) {
			return;
		}
		this.isRecovering = true;
		this.socket
			.emit(SOCKETIO_MPD_UNSUBSCRIBE, toBinary(MpdProfileSchema, profile))
			.catch((err) => {
				console.error(err);
			});
		this.scheduleRetry(profile);
	}

	private scheduleRetry(profile: MpdProfile): void {
		clearTimeout(this.retryTimer);
		const delay = getResubscribeDelayMs(this.retryAttempt);
		this.retryAttempt += 1;
		this.retryTimer = setTimeout(() => {
			this.retryTimer = undefined;
			// Events after the outage were never delivered, so a recovered
			// subscription refetches like one after a transport reconnect.
			this.requestSubscription(profile, true);
		}, delay);
	}

	private resetRecovery(): void {
		clearTimeout(this.retryTimer);
		this.retryTimer = undefined;
		this.retryAttempt = 0;
		this.isRecovering = false;
	}
}
