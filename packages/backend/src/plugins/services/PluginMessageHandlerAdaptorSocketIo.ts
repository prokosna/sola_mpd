import {
	executePluginUseCase,
	registerPluginUseCase,
} from "../application/pluginUseCases.js";
import { pluginClientAdaptorConnect } from "./PluginClientAdaptorConnect.js";
import type { PluginMessageHandlerPort } from "./PluginMessageHandlerPort.js";

export class PluginMessageHandlerAdaptorSocketIo
	implements PluginMessageHandlerPort
{
	async register(msg: Uint8Array): Promise<Uint8Array> {
		return registerPluginUseCase(msg, pluginClientAdaptorConnect);
	}

	execute(msg: Uint8Array): AsyncGenerator<[string, Uint8Array]> {
		return executePluginUseCase(msg, pluginClientAdaptorConnect);
	}
}
