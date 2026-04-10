import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { SOCKETIO_ADVANCED_SEARCH } from "@sola_mpd/shared/src/const/socketio.js";
import {
	type AdvancedSearchRequest,
	AdvancedSearchRequestSchema,
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import type { AdvancedSearchClient } from "./AdvancedSearchClient";

export class AdvancedSearchClientSocketIo implements AdvancedSearchClient {
	constructor(private client: SocketIoClient) {}

	command = async (
		req: AdvancedSearchRequest,
	): Promise<AdvancedSearchResponse> => {
		const res = await this.client.fetch(
			SOCKETIO_ADVANCED_SEARCH,
			toBinary(AdvancedSearchRequestSchema, req),
			(bytes) => fromBinary(AdvancedSearchResponseSchema, bytes),
		);

		if (res.command.case === "error") {
			throw new Error(res.command.value);
		}

		return res;
	};
}
