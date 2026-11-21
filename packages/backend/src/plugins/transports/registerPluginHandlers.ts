import {
	SOCKETIO_PLUGIN_EXECUTE,
	SOCKETIO_PLUGIN_REGISTER,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import { createPluginRegisterErrorBuffer } from "../../utils/errorBufferUtils.js";
import {
	executePluginUseCase,
	registerPluginUseCase,
} from "../application/pluginUseCases.js";
import type { PluginClient } from "../services/PluginClient.js";

export function registerPluginHandlers(
	server: MessagingServer,
	deps: { pluginClient: PluginClient },
): void {
	const { pluginClient } = deps;

	server.handle(SOCKETIO_PLUGIN_REGISTER, async (msg) => {
		try {
			return await registerPluginUseCase(msg, pluginClient);
		} catch (err) {
			console.error(err);
			return createPluginRegisterErrorBuffer(err);
		}
	});

	// ACK on receipt, not completion: results stream via separate events
	// and execution may outlast the client's ACK timeout.
	server.handle(SOCKETIO_PLUGIN_EXECUTE, (msg, peer) => {
		void (async () => {
			try {
				for await (const [callbackEvent, resp] of executePluginUseCase(
					msg,
					pluginClient,
				)) {
					peer.send(callbackEvent, resp);
				}
			} catch (err) {
				console.error(err);
			}
		})();
	});
}
