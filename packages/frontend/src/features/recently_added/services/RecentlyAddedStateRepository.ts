import type { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";

/**
 * Recently added state persistence.
 */
export interface RecentlyAddedStateRepository {
	/**
	 * Get current state.
	 *
	 * @returns Current state
	 * @throws On retrieval failure
	 */
	fetch: () => Promise<RecentlyAddedState>;

	/**
	 * Save current state.
	 *
	 * @param state State to save
	 * @throws On save failure
	 */
	save: (recentlyAddedState: RecentlyAddedState) => Promise<void>;
}
