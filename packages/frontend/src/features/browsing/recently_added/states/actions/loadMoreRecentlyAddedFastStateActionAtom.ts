import { atom } from "jotai";

import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { statsAtom } from "../../../../stats/states/atoms/statsAtom";
import {
	RECENTLY_ADDED_MAX_DAYS,
	RECENTLY_ADDED_STEP_DAYS,
} from "../../const/recentlyAddedDefaults";
import {
	computeSinceTime,
	fetchRecentlyAddedFastDelta,
} from "../../functions/recentlyAddedFastFetch";
import { recentlyAddedFastStateAtom } from "../atoms/recentlyAddedFastStateAtom";

/**
 * Extend the visible window by one step and append the delta. If the step
 * yields zero new songs (a quiet period in the user's library) keep extending
 * until either a non-empty delta arrives, the loaded count reaches
 * `stats.songsCount`, or the cutoff exceeds RECENTLY_ADDED_MAX_DAYS. The first
 * caller bears the cost of crossing quiet periods so a single scroll trigger
 * always surfaces something visible (or terminates the loader).
 */
export const loadMoreRecentlyAddedFastStateActionAtom = atom(
	null,
	async (get, set) => {
		const state = get(recentlyAddedFastStateAtom);
		if (state.isLoading || !state.hasMore) {
			return;
		}

		const mpdClient = get(mpdClientAtom);
		const profile = get(currentMpdProfileAtom);
		const stats = get(statsAtom);
		if (profile === undefined) {
			return;
		}

		set(recentlyAddedFastStateAtom, { ...state, isLoading: true });

		let songs = state.songs;
		let daysVisible = state.daysVisible;
		let hasMore = true;

		try {
			while (true) {
				daysVisible += RECENTLY_ADDED_STEP_DAYS;
				const since = computeSinceTime(daysVisible);
				const delta = await fetchRecentlyAddedFastDelta(
					mpdClient,
					profile,
					since,
					songs.length,
				);
				songs = songs.concat(delta);

				if (stats !== undefined && songs.length >= stats.songsCount) {
					hasMore = false;
					break;
				}
				if (daysVisible >= RECENTLY_ADDED_MAX_DAYS) {
					hasMore = false;
					break;
				}
				if (delta.length > 0) {
					break;
				}
			}
		} finally {
			set(recentlyAddedFastStateAtom, {
				songs,
				daysVisible,
				isLoading: false,
				hasMore,
			});
		}
	},
);
