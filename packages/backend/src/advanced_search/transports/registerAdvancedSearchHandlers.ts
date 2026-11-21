import { SOCKETIO_ADVANCED_SEARCH } from "@sola_mpd/shared/src/const/socketio.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { createAdvancedSearchErrorBuffer } from "../../utils/errorBufferUtils.js";
import { executeAdvancedSearchCommandUseCase } from "../application/advancedSearchUseCases.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";

export function registerAdvancedSearchHandlers(
	server: MessagingServer,
	deps: { advancedSearchApi: AdvancedSearchApi; mpdClient: MpdClient },
): void {
	server.handle(SOCKETIO_ADVANCED_SEARCH, async (msg) => {
		try {
			return await executeAdvancedSearchCommandUseCase(
				msg,
				deps.advancedSearchApi,
				deps.mpdClient,
			);
		} catch (err) {
			console.error(err);
			return createAdvancedSearchErrorBuffer(err);
		}
	});
}
