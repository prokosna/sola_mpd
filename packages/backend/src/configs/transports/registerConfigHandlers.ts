import {
	SOCKETIO_CONFIG_CHANGED,
	SOCKETIO_CONFIG_FETCH,
	SOCKETIO_CONFIG_SAVE,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import type { ConfigRepositories } from "../repositories/ConfigRepository.js";
import { createConfigBindings } from "./configBindings.js";

export function registerConfigHandlers(
	server: MessagingServer,
	deps: { configRepositories: ConfigRepositories },
): void {
	const bindings = createConfigBindings(deps.configRepositories);

	for (const [key, binding] of Object.entries(bindings)) {
		server.handle(`${SOCKETIO_CONFIG_FETCH}_${key}`, () => binding.read());

		server.handle(`${SOCKETIO_CONFIG_SAVE}_${key}`, (msg, peer) => {
			binding.update(Buffer.from(msg));
			try {
				// "Except sender" broadcast: the saving client already has the
				// new value locally, so echoing back to it would trigger a
				// pointless refetch that can race with its own local update.
				server.broadcast(SOCKETIO_CONFIG_CHANGED, Buffer.from(key, "utf-8"), {
					except: peer.id,
				});
			} catch (err) {
				// A broadcast failure must not turn a successful save into a
				// failed one from the caller's perspective.
				console.error(err);
			}
		});
	}
}
