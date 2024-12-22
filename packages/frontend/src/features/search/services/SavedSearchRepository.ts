import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";

/**
 * Saved search repository.
 */
export interface SavedSearchRepository {
  fetch: () => Promise<SavedSearches>;
  save: (savedSearches: SavedSearches) => Promise<void>;
}
