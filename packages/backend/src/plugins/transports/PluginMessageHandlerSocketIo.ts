import {
	executePluginUseCase,
	registerPluginUseCase,
} from "../application/pluginUseCases.js";
import type { PluginClient } from "../services/PluginClient.js";
import type { PluginMessageHandler } from "./PluginMessageHandler.js";

export class PluginMessageHandlerSocketIo implements PluginMessageHandler {
	constructor(private readonly pluginClient: PluginClient) {}

	async register(msg: Uint8Array): Promise<Uint8Array> {
		return registerPluginUseCase(msg, this.pluginClient);
	}

	execute(msg: Uint8Array): AsyncGenerator<[string, Uint8Array]> {
		return executePluginUseCase(msg, this.pluginClient);
	}
}
