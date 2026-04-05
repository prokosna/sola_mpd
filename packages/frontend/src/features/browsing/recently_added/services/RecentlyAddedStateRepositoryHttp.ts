import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_RECENTLY_ADDED_STATE } from "@sola_mpd/shared/src/const/api.js";
import {
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { HttpClient } from "../../../../lib/http/HttpClient";
import type { RecentlyAddedStateRepository } from "./RecentlyAddedStateRepository";

export class RecentlyAddedStateRepositoryHttp
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
