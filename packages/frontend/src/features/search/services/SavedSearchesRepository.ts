import type { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";

/**
 * Repository for saved searches persistence.
 *
 * Handles search configuration storage and state
 * management across sessions.
 */
export interface SavedSearchesRepository {
	/**
	 * Fetch current saved searches state.
	 *
	 * @returns Current state
	 * @throws On retrieval failure
	 */
	fetch: () => Promise<SavedSearches>;

	/**
	 * Save current searches state.
	 *
	 * @param state State to save
	 * @throws On save failure
	 */
	save: (savedSearches: SavedSearches) => Promise<void>;
}
