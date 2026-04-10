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

import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import type { MpdListener } from "./MpdListener";

export class MpdListenerSocketIo implements MpdListener {
	private socket: SocketIoClient;
	private callbacks: Map<MpdEvent_EventType, () => void>;

	constructor(socketIoClient: SocketIoClient) {
		this.socket = socketIoClient;
		this.callbacks = new Map();
	}

	subscribe = (profile: MpdProfile): void => {
		this.socket.on(SOCKETIO_MPD_EVENT, (msg: Uint8Array) => {
			const event = fromBinary(MpdEventSchema, msg);
			console.info(`MPD event: ${MpdEvent_EventType[event.eventType]}`);
			this.callbacks.get(event.eventType)?.();
		});
		this.socket.emit(
			SOCKETIO_MPD_SUBSCRIBE,
			toBinary(MpdProfileSchema, profile),
		);
	};

	unsubscribe = (profile: MpdProfile): void => {
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
}
