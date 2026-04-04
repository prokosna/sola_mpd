import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SIO_MESSAGE,
	SIO_MPD_EVENT,
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
import { mpdClientAdaptorMpd3 } from "./MpdClientAdaptorMpd3.js";
import type { MpdSubscriptionHandler } from "./MpdClientPort.js";
import type {
	MpdMessageHandlerPort,
	MpdTransportConnection,
} from "./MpdMessageHandlerPort.js";

export class MpdMessageHandlerAdaptorSocketIo implements MpdMessageHandlerPort {
	private idEventHandlerMap: DeepMap<
		[string, MpdProfile],
		Promise<MpdSubscriptionHandler>
	>;

	private constructor(private io: IOServer) {
		this.idEventHandlerMap = new DeepMap();
	}

	static initialize(io: IOServer): MpdMessageHandlerAdaptorSocketIo {
		return new MpdMessageHandlerAdaptorSocketIo(io);
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
					this.io.to(room).emit(SIO_MPD_EVENT, toBinary(MpdEventSchema, event));
				},
				mpdClientPort: mpdClientAdaptorMpd3,
			});

			const room = `${profile.host}:${profile.port}`;
			connection.join(room);
			this.idEventHandlerMap.set([id, profile], handlerPromise);
			await handlerPromise;
			console.info(`New client registered: ${id} for ${room}`);
		} catch (err) {
			console.error(err);
			connection.emit(SIO_MESSAGE, err);
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
				mpdClientPort: mpdClientAdaptorMpd3,
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
			connection.emit(SIO_MESSAGE, err);
		}
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeMpdCommandUseCase(msg, mpdClientAdaptorMpd3);
	}

	async commandBulk(msg: Uint8Array): Promise<void> {
		return executeMpdCommandBulkUseCase(msg, mpdClientAdaptorMpd3);
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
				mpdClientPort: mpdClientAdaptorMpd3,
			});
			this.idEventHandlerMap.delete(key);
			const room = `${profile.host}:${profile.port}`;
			connection.leave(room);
		}
	}
}
