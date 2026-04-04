import { mpdClientAdaptorMpd3 } from "../../mpd/services/MpdClientAdaptorMpd3.js";
import { executeAdvancedSearchCommandUseCase } from "../application/advancedSearchUseCases.js";
import { advancedSearchApiAdaptorHttp } from "./AdvancedSearchApiAdaptorHttp.js";
import type { AdvancedSearchMessageHandlerPort } from "./AdvancedSearchMessageHandlerPort.js";

export class AdvancedSearchMessageHandlerAdaptorSocketIo
	implements AdvancedSearchMessageHandlerPort
{
	static initialize(): AdvancedSearchMessageHandlerAdaptorSocketIo {
		return new AdvancedSearchMessageHandlerAdaptorSocketIo();
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeAdvancedSearchCommandUseCase(
			msg,
			advancedSearchApiAdaptorHttp,
			mpdClientAdaptorMpd3,
		);
	}
}
