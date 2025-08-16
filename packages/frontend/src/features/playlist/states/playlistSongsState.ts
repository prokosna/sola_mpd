import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAYLIST } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchPlaylistSongs } from "../utils/playlistUtils";

import { selectedPlaylistAtom } from "./playlistState";

/**
 * Base atom for playlist songs state.
 *
 * Fetches songs from selected playlist with profile-based
 * access control. Returns empty array if no playlist.
 */
const playlistSongsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);
	const selectedPlaylist = get(selectedPlaylistAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (selectedPlaylist === undefined) {
		return [];
	}

	const songs = await fetchPlaylistSongs(mpdClient, profile, selectedPlaylist);

	return songs;
});

/**
 * Synchronized atom for playlist songs state.
 *
 * Ensures consistent updates across all subscribers when
 * the playlist songs change.
 */
const playlistSongsSyncAtom = atomWithSync(playlistSongsAtom);

/**
 * Derived atom for filtered playlist songs.
 *
 * Applies global filter to playlist songs and manages
 * route-specific visibility.
 */
const playlistVisibleSongsSyncAtom = atom((get) => {
	const playlistSongs = get(playlistSongsSyncAtom);
	const songTableState = get(songTableStateSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_PLAYLIST ||
		playlistSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	const filteredSongs = filterSongsByGlobalFilter(
		playlistSongs,
		globalFilterTokens,
		songTableState.columns,
	);

	return filteredSongs;
});

/**
 * Hook for accessing filtered playlist songs.
 *
 * Provides read-only access to current playlist songs
 * with global filter applied.
 *
 * @returns Filtered songs or undefined
 */
export function usePlaylistSongsState() {
	return useAtomValue(playlistVisibleSongsSyncAtom);
}

/**
 * Hook for refreshing playlist songs.
 *
 * Returns function to trigger fresh fetch from MPD
 * server. Useful for manual refresh or error recovery.
 *
 * @returns Refresh function
 */
export function useRefreshPlaylistSongsState() {
	return useSetAtom(playlistSongsAtom);
}
