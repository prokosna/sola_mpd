import {
	executePluginUseCase,
	registerPluginUseCase,
} from "../application/pluginUseCases.js";
import { pluginClientConnect } from "../services/PluginClientConnect.js";
import type { PluginMessageHandler } from "./PluginMessageHandler.js";

export class PluginMessageHandlerSocketIo implements PluginMessageHandler {
	async register(msg: Uint8Array): Promise<Uint8Array> {
		return registerPluginUseCase(msg, pluginClientConnect);
	}

	execute(msg: Uint8Array): AsyncGenerator<[string, Uint8Array]> {
		return executePluginUseCase(msg, pluginClientConnect);
	}
}
