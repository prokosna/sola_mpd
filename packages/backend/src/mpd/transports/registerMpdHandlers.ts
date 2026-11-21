import { fromBinary } from "@bufbuild/protobuf";
import {
	SOCKETIO_MPD_COMMAND,
	SOCKETIO_MPD_COMMAND_BULK,
	SOCKETIO_MPD_SUBSCRIBE,
	SOCKETIO_MPD_UNSUBSCRIBE,
} from "@sola_mpd/shared/src/const/socketio.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import { createMpdErrorBuffer } from "../../utils/errorBufferUtils.js";
import {
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
} from "../application/mpdUseCases.js";
import type { MpdClient } from "../services/MpdClient.js";
import { MpdEventSubscriptions } from "./MpdEventSubscriptions.js";

export function registerMpdHandlers(
	server: MessagingServer,
	deps: { mpdClient: MpdClient },
): void {
	const { mpdClient } = deps;
	const subscriptions = new MpdEventSubscriptions(mpdClient);

	server.handle(SOCKETIO_MPD_COMMAND, async (msg) => {
		try {
			return await executeMpdCommandUseCase(msg, mpdClient);
		} catch (err) {
			console.error(err);
			return createMpdErrorBuffer(err);
		}
	});

	server.handle(SOCKETIO_MPD_COMMAND_BULK, async (msg) => {
		await executeMpdCommandBulkUseCase(msg, mpdClient);
	});

	server.handle(SOCKETIO_MPD_SUBSCRIBE, async (msg, peer) => {
		await subscriptions.subscribe(peer, fromBinary(MpdProfileSchema, msg));
	});

	server.handle(SOCKETIO_MPD_UNSUBSCRIBE, async (msg, peer) => {
		await subscriptions.unsubscribe(peer.id, fromBinary(MpdProfileSchema, msg));
	});

	server.onDisconnect((peer) => subscriptions.disconnect(peer.id));
}
