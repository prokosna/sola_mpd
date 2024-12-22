import { API_CONFIGS_SAVED_SEARCHES } from "@sola_mpd/domain/src/const/api.js";
import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";

import { SavedSearchRepository } from "../../features/search";
import { HttpClient } from "../http/HttpClient";

/**
 * Implementation of SavedSearchRepository using HttpClient.
 */
export class SavedSearchRepositoryImplHttp implements SavedSearchRepository {
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
