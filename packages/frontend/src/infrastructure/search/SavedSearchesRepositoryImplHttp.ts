import { API_CONFIGS_SAVED_SEARCHES } from "@sola_mpd/domain/src/const/api.js";
import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";

import type { SavedSearchesRepository } from "../../features/search";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of SavedSearchesRepository using HttpClient.
 */
export class SavedSearchesRepositoryImplHttp
	implements SavedSearchesRepository
{
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<SavedSearches> => {
		return this.client.get<SavedSearches>(
			API_CONFIGS_SAVED_SEARCHES,
			SavedSearches.fromBinary,
		);
	};

	save = async (savedSearches: SavedSearches): Promise<void> => {
		return this.client.post(
			API_CONFIGS_SAVED_SEARCHES,
			savedSearches.toBinary(),
		);
	};
}
