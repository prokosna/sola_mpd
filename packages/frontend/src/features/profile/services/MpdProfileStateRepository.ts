import type { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

/**
 * Repository for MPD profile state persistence.
 *
 * Handles profile configuration storage and state
 * management across sessions.
 */
export interface MpdProfileStateRepository {
	/**
	 * Fetch current MPD profile state.
	 *
	 * @returns Current profile state
	 * @throws On retrieval failure
	 */
	fetch: () => Promise<MpdProfileState>;

	/**
	 * Save current MPD profile state.
	 *
	 * @param state Profile state to save
	 * @throws On save failure
	 */
	save: (mpdProfileState: MpdProfileState) => Promise<void>;
}
