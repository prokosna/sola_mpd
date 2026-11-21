import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MESSAGE,
	SOCKETIO_MPD_EVENT,
} from "@sola_mpd/shared/src/const/socketio.js";
import {
	MpdEvent_EventType,
	MpdEventSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { DeepMap } from "@sola_mpd/shared/src/utils/DeepMap.js";
import {
	disconnectMpdEventsUseCase,
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
	subscribeMpdEventsUseCase,
	unsubscribeMpdEventsUseCase,
} from "../application/mpdUseCases.js";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";
import type {
	MpdMessageHandler,
	MpdTransportConnection,
} from "./MpdMessageHandler.js";

export class MpdMessageHandlerSocketIo implements MpdMessageHandler {
	private idEventHandlerMap: DeepMap<
		[string, MpdProfile],
		Promise<MpdSubscriptionHandler>
	>;

	private constructor(private readonly mpdClient: MpdClient) {
		this.idEventHandlerMap = new DeepMap();
	}

	static initialize(mpdClient: MpdClient): MpdMessageHandlerSocketIo {
		return new MpdMessageHandlerSocketIo(mpdClient);
	}

	async subscribeEvents(
		id: string,
		msg: Uint8Array,
		connection: MpdTransportConnection,
	): Promise<void> {
		const targetProfile = fromBinary(MpdProfileSchema, msg);
		const existing = this.idEventHandlerMap.get([id, targetProfile]);
		if (existing !== undefined) {
			await existing;
			return;
		}

		const target = `${targetProfile.host}:${targetProfile.port}`;
		const handlerPromise = subscribeMpdEventsUseCase({
			msg,
			onEvent: (event) => {
				connection.emit(SOCKETIO_MPD_EVENT, toBinary(MpdEventSchema, event));
				if (event.eventType === MpdEvent_EventType.DISCONNECTED) {
					this.idEventHandlerMap.delete([id, targetProfile]);
				}
			},
			mpdClient: this.mpdClient,
		}).then(({ handlerPromise: innerPromise }) => innerPromise);

		this.idEventHandlerMap.set([id, targetProfile], handlerPromise);
		try {
			await handlerPromise;
		} catch (err) {
			if (this.idEventHandlerMap.get([id, targetProfile]) === handlerPromise) {
				this.idEventHandlerMap.delete([id, targetProfile]);
			}
			throw err;
		}
		console.info(`New client registered: ${id} for ${target}`);
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
				mpdClient: this.mpdClient,
			});
			if (unsubscribedProfile !== undefined) {
				this.idEventHandlerMap.delete([id, unsubscribedProfile]);
				console.info(
					`${id}.${unsubscribedProfile.name} has been unsubscribed.`,
				);
			}
		} catch (err) {
			console.error(err);
			connection.emit(
				SOCKETIO_MESSAGE,
				err instanceof Error ? err.message : String(err),
			);
		}
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeMpdCommandUseCase(msg, this.mpdClient);
	}

	async commandBulk(msg: Uint8Array): Promise<void> {
		return executeMpdCommandBulkUseCase(msg, this.mpdClient);
	}

	async disconnect(
		id: string,
		_connection: MpdTransportConnection,
	): Promise<void> {
		const entries = Array.from(this.idEventHandlerMap).filter(
			([[keyId]]) => keyId === id,
		);
		for (const [key, handlerPromise] of entries) {
			const [, profile] = key;
			this.idEventHandlerMap.delete(key);
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
