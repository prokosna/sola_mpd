import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { executeAdvancedSearchCommandUseCase } from "../application/advancedSearchUseCases.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";
import type { AdvancedSearchMessageHandler } from "./AdvancedSearchMessageHandler.js";

export class AdvancedSearchMessageHandlerSocketIo
	implements AdvancedSearchMessageHandler
{
	static initialize(
		advancedSearchApi: AdvancedSearchApi,
		mpdClient: MpdClient,
	): AdvancedSearchMessageHandlerSocketIo {
		return new AdvancedSearchMessageHandlerSocketIo(
			advancedSearchApi,
			mpdClient,
		);
	}

	private constructor(
		private readonly advancedSearchApi: AdvancedSearchApi,
		private readonly mpdClient: MpdClient,
	) {}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		return executeAdvancedSearchCommandUseCase(
			msg,
			this.advancedSearchApi,
			this.mpdClient,
		);
	}
}
