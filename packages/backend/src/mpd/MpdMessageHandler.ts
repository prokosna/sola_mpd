import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	SIO_MESSAGE,
	SIO_MPD_EVENT,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
	MpdRequestBulkSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import {
	type MpdEvent,
	MpdEventSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { DeepMap } from "@sola_mpd/domain/src/utils/DeepMap.js";
import type { Server as IOServer, Socket } from "socket.io";
import { mpdClient } from "./mpdClient.js";

/**
 * MpdMessageHandler is a class that handles messages from socket.io clients.
 *
 * It provides methods to subscribe and unsubscribe to events emitted by mpd.
 * It also provides methods to send commands to mpd.
 */
export class MpdMessageHandler {
	// Map of [Socket.io ID, MPD Profile] => List of handler promises.
	private idEventHandlerMap: DeepMap<
		[string, MpdProfile],
		Promise<(name?: string) => void>
	>;

	private constructor(private io: IOServer) {
		this.idEventHandlerMap = new DeepMap();
	}

	static initialize(io: IOServer): MpdMessageHandler {
		const mpdMessageHandler = new MpdMessageHandler(io);
		return mpdMessageHandler;
	}

	async subscribeEvents(
		id: string,
		msg: Uint8Array,
		socket: Socket,
	): Promise<void> {
		try {
			const profile = fromBinary(MpdProfileSchema, msg);
			if (this.idEventHandlerMap.has([id, profile])) {
				return;
			}

			const room = `${profile.host}:${profile.port}`;
			socket.join(room); // join() is idempotent.

			// Event listener.
			const handlePromise = mpdClient.subscribe(profile, (event: MpdEvent) => {
				this.io.to(room).emit(SIO_MPD_EVENT, toBinary(MpdEventSchema, event));
			});
			this.idEventHandlerMap.set([id, profile], handlePromise);
			await handlePromise;

			console.info(`New client registered: ${id} for ${room}`);
		} catch (err) {
			console.error(err);
			socket.emit(SIO_MESSAGE, err);
		}
		return;
	}

	async unsubscribeEvents(
		id: string,
		msg: Uint8Array,
		socket: Socket,
	): Promise<void> {
		const profile = fromBinary(MpdProfileSchema, msg);
		if (!this.idEventHandlerMap.has([id, profile])) {
			return;
		}

		try {
			const handlerPromise = this.idEventHandlerMap.get([id, profile]);
			this.idEventHandlerMap.delete([id, profile]);
			if (handlerPromise === undefined) {
				return;
			}

			const room = `${profile.host}:${profile.port}`;
			socket.leave(room);
			await mpdClient.unsubscribe(profile, await handlerPromise);

			console.info(`${id}.${profile.name} has been unsubscribed.`);
		} catch (err) {
			console.error(err);
			socket.emit(SIO_MESSAGE, err);
		}
		return;
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		const req = fromBinary(MpdRequestSchema, msg);
		const res = await mpdClient.execute(req);
		return toBinary(MpdResponseSchema, res);
	}

	async commandBulk(msg: Uint8Array): Promise<void> {
		const req = fromBinary(MpdRequestBulkSchema, msg);
		await mpdClient.executeBulk(req.requests);
		return;
	}

	async disconnect(id: string, socket: Socket): Promise<void> {
		for (const [key, handlerPromise] of this.idEventHandlerMap) {
			const [keyId, keyProfile] = key;
			if (keyId !== id) {
				continue;
			}
			this.idEventHandlerMap.delete(key);
			const room = `${keyProfile.host}:${keyProfile.port}`;
			socket.leave(room); // leave() is idempotent.
			mpdClient.unsubscribe(keyProfile, await handlerPromise);
		}
	}
}
