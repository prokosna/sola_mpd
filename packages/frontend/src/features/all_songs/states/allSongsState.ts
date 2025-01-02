import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_ALL_SONGS } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchAllSongs } from "../utils/allSongsUtils";

/**
 * Base atom for storing all songs fetched from MPD server.
 * Automatically refreshes when MPD client or profile changes.
 */
const allSongsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);

	if (profile === undefined) {
		return undefined;
	}

	const songs = await fetchAllSongs(mpdClient, profile);

	return songs;
});

/**
 * Synchronized atom for all songs with persistence support.
 */
export const allSongsSyncAtom = atomWithSync(allSongsAtom);

/**
 * Derived atom that filters songs based on global filter and current route.
 * Only returns songs when on the All Songs route.
 */
const allSongsVisibleSongsSyncAtom = atom((get) => {
	const allSongs = get(allSongsSyncAtom);
	const songTableState = get(songTableStateSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_ALL_SONGS ||
		allSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	const filteredSongs = filterSongsByGlobalFilter(
		allSongs,
		globalFilterTokens,
		songTableState.columns,
	);

	return filteredSongs;
});

/**
 * Hook to access the filtered songs in the All Songs view.
 *
 * @returns Filtered array of Song objects, or undefined if not in All Songs view
 */
export function useAllSongsState() {
	return useAtomValue(allSongsVisibleSongsSyncAtom);
}

/**
 * Hook to refresh the All Songs data from the MPD server.
 *
 * @returns Refresh function that updates the songs state
 */
export function useRefreshAllSongsState() {
	return useSetAtom(allSongsAtom);
}
