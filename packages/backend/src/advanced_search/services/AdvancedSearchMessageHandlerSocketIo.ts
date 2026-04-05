import { mpdClientMpd3 } from "../../mpd/services/MpdClientMpd3.js";
import { executeAdvancedSearchCommandUseCase } from "../application/advancedSearchUseCases.js";
import { advancedSearchApiHttp } from "./AdvancedSearchApiHttp.js";
import type { AdvancedSearchMessageHandler } from "./AdvancedSearchMessageHandler.js";

export class AdvancedSearchMessageHandlerSocketIo
	implements AdvancedSearchMessageHandler
{
	static initialize(): AdvancedSearchMessageHandlerSocketIo {
		return new AdvancedSearchMessageHandlerSocketIo();
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeAdvancedSearchCommandUseCase(
			msg,
			advancedSearchApiHttp,
			mpdClientMpd3,
		);
	}
}
