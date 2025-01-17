import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../../location/states/locationState";
import { mpdClientAtom } from "../../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../../song_table/states/songTableState";
import { fetchBrowserSongs } from "../../common/utils/browserSongsUtils";
import { recentlyAddedBrowserFiltersSyncAtom } from "./recentlyAddedFiltersState";

/**
 * Recently added songs management.
 */
const recentlyAddedSongsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const currentMpdProfile = get(currentMpdProfileSyncAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersSyncAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	const songs = await fetchBrowserSongs(
		mpdClient,
		currentMpdProfile,
		browserFilters,
	);

	return songs;
});

/**
 * Synchronized recently added songs.
 */
const recentlyAddedSongsSyncAtom = atomWithSync(recentlyAddedSongsAtom);

/**
 * Get visible recently added songs.
 *
 * @returns Filtered songs
 */
const recentlyAddedVisibleSongsSyncAtom = atom((get) => {
	const recentlyAddedSongs = get(recentlyAddedSongsSyncAtom);
	const songTableState = get(songTableStateSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_RECENTLY_ADDED ||
		recentlyAddedSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	const filteredSongs = filterSongsByGlobalFilter(
		recentlyAddedSongs,
		globalFilterTokens,
		songTableState.columns,
	);

	return filteredSongs;
});

/**
 * Get visible recently added songs.
 *
 * @returns Filtered songs
 */
export function useRecentlyAddedSongsState() {
	return useAtomValue(recentlyAddedVisibleSongsSyncAtom);
}

/**
 * Refresh recently added songs.
 *
 * @returns Refresh function
 */
export function useRefreshRecentlyAddedSongsState() {
	return useSetAtom(recentlyAddedSongsAtom);
}
