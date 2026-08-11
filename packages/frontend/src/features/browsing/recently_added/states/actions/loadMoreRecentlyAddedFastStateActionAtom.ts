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
 * Keeps extending past a step that yields nothing — a quiet period in the
 * library — so one scroll trigger always either surfaces songs or terminates
 * the loader, instead of asking the user to scroll again for each empty step.
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
