import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { SOCKETIO_ADVANCED_SEARCH } from "@sola_mpd/shared/src/const/socketio.js";
import {
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { MessagingServer } from "../../lib/messaging/MessagingServer.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { createAdvancedSearchErrorBuffer } from "../../utils/errorBufferUtils.js";
import { executeAdvancedSearchRequestUseCase } from "../application/advancedSearchUseCases.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";

export function registerAdvancedSearchHandlers(
	server: MessagingServer,
	deps: { advancedSearchApi: AdvancedSearchApi; mpdClient: MpdClient },
): void {
	server.handle(SOCKETIO_ADVANCED_SEARCH, async (msg) => {
		try {
			const response = await executeAdvancedSearchRequestUseCase(
				fromBinary(AdvancedSearchRequestSchema, msg),
				deps.advancedSearchApi,
				deps.mpdClient,
			);
			return toBinary(AdvancedSearchResponseSchema, response);
		} catch (err) {
			console.error(err);
			return createAdvancedSearchErrorBuffer(err);
		}
	});
}
