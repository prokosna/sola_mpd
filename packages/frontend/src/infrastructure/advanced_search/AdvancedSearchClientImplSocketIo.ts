import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { SIO_ADVANCED_SEARCH } from "@sola_mpd/domain/src/const/socketio.js";
import {
	type AdvancedSearchRequest,
	AdvancedSearchRequestSchema,
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import type { AdvancedSearchClient } from "../../features/advanced_search";
import type { SocketIoClient } from "../socket_io/SocketIoClient";

/**
 * AdvancedSearchClientSocketIo is an implementation of AdvancedSearchClient that uses socket.io as the underlying transport.
 */
export class AdvancedSearchClientImplSocketIo implements AdvancedSearchClient {
	constructor(private client: SocketIoClient) {}

	command = async (
		req: AdvancedSearchRequest,
	): Promise<AdvancedSearchResponse> => {
		const res = await this.client.fetch(
			SIO_ADVANCED_SEARCH,
			toBinary(AdvancedSearchRequestSchema, req),
			(bytes) => fromBinary(AdvancedSearchResponseSchema, bytes),
		);

		if (res.command.case === "error") {
			throw new Error(res.command.value);
		}

		return res;
	};
}
