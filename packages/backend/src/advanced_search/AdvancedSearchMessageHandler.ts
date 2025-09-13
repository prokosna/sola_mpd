import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import { advancedSearchClient } from "./advancedSearchClient.js";

export class AdvancedSearchMessageHandler {
	static initialize(): AdvancedSearchMessageHandler {
		const advancedSearchMessageHandler = new AdvancedSearchMessageHandler();
		return advancedSearchMessageHandler;
	}

	async command(msg: Uint8Array): Promise<Uint8Array> {
		const req = fromBinary(AdvancedSearchRequestSchema, msg);
		const res = await advancedSearchClient.execute(req);
		return toBinary(AdvancedSearchResponseSchema, res);
	}
}
