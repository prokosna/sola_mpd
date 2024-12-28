import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";

/**
 * Saved searches repository.
 */
export interface SavedSearchesRepository {
  fetch: () => Promise<SavedSearches>;
  save: (savedSearches: SavedSearches) => Promise<void>;
}
