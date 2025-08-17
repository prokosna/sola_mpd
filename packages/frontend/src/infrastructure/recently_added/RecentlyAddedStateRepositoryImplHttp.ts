import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_RECENTLY_ADDED_STATE } from "@sola_mpd/domain/src/const/api.js";
import {
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/domain/src/models/recently_added_pb.js";
import type { RecentlyAddedStateRepository } from "../../features/browsing";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of RecentlyAddedStateRepository using HttpClient.
 */
export class RecentlyAddedStateRepositoryImplHttp
	implements RecentlyAddedStateRepository
{
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<RecentlyAddedState> => {
		return this.client.get<RecentlyAddedState>(
			API_CONFIGS_RECENTLY_ADDED_STATE,
			(bytes) => fromBinary(RecentlyAddedStateSchema, bytes),
		);
	};

	save = async (recentlyAddedState: RecentlyAddedState): Promise<void> => {
		return this.client.post(
			API_CONFIGS_RECENTLY_ADDED_STATE,
			toBinary(RecentlyAddedStateSchema, recentlyAddedState),
		);
	};
}
