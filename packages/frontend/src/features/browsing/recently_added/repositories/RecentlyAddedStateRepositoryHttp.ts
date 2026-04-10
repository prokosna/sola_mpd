import { API_CONFIGS_RECENTLY_ADDED_STATE } from "@sola_mpd/shared/src/const/api.js";
import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { HttpClient } from "../../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../../common/repositories/StateRepositoryHttp";

export class RecentlyAddedStateRepositoryHttp extends StateRepositoryHttp<RecentlyAddedState> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_RECENTLY_ADDED_STATE, RecentlyAddedStateSchema);
	}
}
