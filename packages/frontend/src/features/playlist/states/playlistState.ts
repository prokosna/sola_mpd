import type { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { localeCollatorAtom } from "../../settings/states/settingsLocale";
import { fetchPlaylists } from "../utils/playlistUtils";

/**
 * Base atom for playlists state.
 *
 * Fetches and sorts playlists from MPD server with
 * profile-based access control.
 */
const playlistsAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);
	const collator = get(localeCollatorAtom);

	if (profile === undefined) {
		return [];
	}

	const playlists = await fetchPlaylists(mpdClient, profile);
	return playlists.sort((a, b) => collator.compare(a.name, b.name));
});

/**
 * Synchronized atom for playlists state.
 *
 * Ensures consistent updates across all subscribers when
 * the playlists change.
 */
const playlistsSyncAtom = atomWithSync(playlistsAtom);

/**
 * Atom for selected playlist.
 *
 * Tracks currently selected playlist in UI.
 */
export const selectedPlaylistAtom = atom<Playlist | undefined>(undefined);

/**
 * Hook for accessing playlists state.
 *
 * Provides read-only access to current playlists.
 * Auto-updates when playlists change.
 *
 * @returns Current playlists or empty array
 */
export function usePlaylistsState() {
	return useAtomValue(playlistsSyncAtom);
}

/**
 * Hook for refreshing playlists.
 *
 * Returns function to trigger fresh fetch from MPD
 * server. Useful for manual refresh or error recovery.
 *
 * @returns Refresh function
 */
export function useRefreshPlaylistsState() {
	return useSetAtom(playlistsAtom);
}

/**
 * Hook for accessing selected playlist.
 *
 * Provides read-only access to current selection.
 * Auto-updates when selection changes.
 *
 * @returns Selected playlist or undefined
 */
export function useSelectedPlaylistState() {
	return useAtomValue(selectedPlaylistAtom);
}

/**
 * Hook for updating selected playlist.
 *
 * Returns function to set current playlist selection.
 *
 * @returns Selection update function
 */
export function useSetSelectedPlaylistState() {
	return useSetAtom(selectedPlaylistAtom);
}
