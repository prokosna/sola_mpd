import type { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_SEARCH } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchSearchSongs } from "../utils/searchSongsUtils";
import { searchSongTableColumnsAtom } from "./searchEditState";

/**
 * Atom for target search config.
 *
 * Controls which search to execute.
 */
const targetSearchAtom = atom<Search | undefined>(undefined);

/**
 * Atom for search results.
 *
 * Fetches and stores matching songs.
 */
const searchSongsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);
	const search = get(targetSearchAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (search === undefined) {
		return [];
	}

	const songs = await fetchSearchSongs(mpdClient, profile, search);

	return songs;
});

/**
 * Synchronized atom for search results.
 *
 * This atom wraps the base searchSongsAtom with synchronization
 * capabilities, ensuring that all subscribers receive consistent
 * updates when the results change.
 */
const searchSongsSyncAtom = atomWithSync(searchSongsAtom);

/**
 * Derived atom for visible search results.
 *
 * This atom filters the search results based on:
 * - Current route/pathname
 * - Global filter settings
 * - Editing search columns
 *
 * Features:
 * - Route-aware filtering
 * - Global search integration
 * - Column-based filtering
 */
const searchVisibleSongsSyncAtom = atom((get) => {
	const searchSongs = get(searchSongsSyncAtom);
	const searchSongTableColumns = get(searchSongTableColumnsAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (pathname !== ROUTE_HOME_SEARCH || searchSongs === undefined) {
		return undefined;
	}

	const filteredSongs = filterSongsByGlobalFilter(
		searchSongs,
		globalFilterTokens,
		searchSongTableColumns,
	);

	return filteredSongs;
});

/**
 * Hook for target search config.
 *
 * Provides read-only access to active search.
 *
 * @returns Current target search
 */
export function useTargetSearchState() {
	return useAtomValue(targetSearchAtom);
}

/**
 * Hook for updating target search.
 *
 * Updates search config and triggers execution.
 *
 * @returns Update function
 */
export function useSetTargetSearchState() {
	return useSetAtom(targetSearchAtom);
}

/**
 * Hook for visible search results.
 *
 * Provides filtered songs based on search and filters.
 *
 * @returns Filtered song list
 */
export function useSearchSongsState() {
	return useAtomValue(searchVisibleSongsSyncAtom);
}

/**
 * Hook for refreshing search results.
 *
 * Triggers fresh search execution.
 *
 * @returns Refresh function
 */
export function useRefreshSearchSongsState() {
	return useSetAtom(searchSongsAtom);
}
