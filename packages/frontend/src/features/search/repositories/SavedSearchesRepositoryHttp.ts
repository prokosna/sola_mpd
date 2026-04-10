import { API_CONFIGS_SAVED_SEARCHES } from "@sola_mpd/shared/src/const/api.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../common/repositories/StateRepositoryHttp";

export class SavedSearchesRepositoryHttp extends StateRepositoryHttp<SavedSearches> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_SAVED_SEARCHES, SavedSearchesSchema);
	}
}
