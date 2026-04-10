import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MESSAGE,
	SOCKETIO_MPD_EVENT,
} from "@sola_mpd/shared/src/const/socketio.js";
import { MpdEventSchema } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { DeepMap } from "@sola_mpd/shared/src/utils/DeepMap.js";
import type { Server as IOServer } from "socket.io";
import {
	disconnectMpdEventsUseCase,
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
} from "../application/mpdUseCases.js";
import type { MpdSubscriptionHandler } from "../services/MpdClient.js";
import { mpdClientMpd3 } from "../services/MpdClientMpd3.js";
import type {
	MpdMessageHandler,
	MpdTransportConnection,
} from "./MpdMessageHandler.js";

export class MpdMessageHandlerSocketIo implements MpdMessageHandler {
	private idEventHandlerMap: DeepMap<
		[string, MpdProfile],
		Promise<MpdSubscriptionHandler>
	>;

	private constructor(private io: IOServer) {
		this.idEventHandlerMap = new DeepMap();
	}

	static initialize(io: IOServer): MpdMessageHandlerSocketIo {
		return new MpdMessageHandlerSocketIo(io);
	}

	async subscribeEvents(
		id: string,
		msg: Uint8Array,
		connection: MpdTransportConnection,
	): Promise<void> {
		try {
			const targetProfile = fromBinary(MpdProfileSchema, msg);
			if (this.idEventHandlerMap.has([id, targetProfile])) {
				return;
			}

			const { profile, handlerPromise } = await subscribeMpdEventsUseCase({
				msg,
				onEvent: (event) => {
					const room = `${profile.host}:${profile.port}`;
					this.io
						.to(room)
						.emit(SOCKETIO_MPD_EVENT, toBinary(MpdEventSchema, event));
				},
				mpdClient: mpdClientMpd3,
			});

			const room = `${profile.host}:${profile.port}`;
			connection.join(room);
			this.idEventHandlerMap.set([id, profile], handlerPromise);
			await handlerPromise;
			console.info(`New client registered: ${id} for ${room}`);
		} catch (err) {
			console.error(err);
			connection.emit(SOCKETIO_MESSAGE, err);
		}
	}

	async unsubscribeEvents(
		id: string,
		msg: Uint8Array,
		connection: MpdTransportConnection,
	): Promise<void> {
		try {
			const profile = fromBinary(MpdProfileSchema, msg);
			const handlerPromise = this.idEventHandlerMap.get([id, profile]);
			if (handlerPromise === undefined) {
				return;
			}

			const unsubscribedProfile = await unsubscribeMpdEventsUseCase({
				msg,
				handlerPromise,
				mpdClient: mpdClientMpd3,
			});
			if (unsubscribedProfile !== undefined) {
				this.idEventHandlerMap.delete([id, unsubscribedProfile]);
				const room = `${unsubscribedProfile.host}:${unsubscribedProfile.port}`;
				connection.leave(room);
				console.info(
					`${id}.${unsubscribedProfile.name} has been unsubscribed.`,
				);
			}
		} catch (err) {
			console.error(err);
			connection.emit(SOCKETIO_MESSAGE, err);
		}
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeMpdCommandUseCase(msg, mpdClientMpd3);
	}

	async commandBulk(msg: Uint8Array): Promise<void> {
		return executeMpdCommandBulkUseCase(msg, mpdClientMpd3);
	}

	async disconnect(
		id: string,
		connection: MpdTransportConnection,
	): Promise<void> {
		for (const [key, handlerPromise] of this.idEventHandlerMap) {
			const [keyId, profile] = key;
			if (keyId !== id) {
				continue;
			}

			await disconnectMpdEventsUseCase({
				profile,
				handlerPromise,
				mpdClient: mpdClientMpd3,
			});
			this.idEventHandlerMap.delete(key);
			const room = `${profile.host}:${profile.port}`;
			connection.leave(room);
		}
	}
}
