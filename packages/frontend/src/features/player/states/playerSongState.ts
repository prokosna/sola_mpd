import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh, selectAtom } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchCurrentSong } from "../utils/playerUtils";

/**
 * Base atom for current song state.
 *
 * Fetches current song from MPD server with profile-based
 * access control. Returns undefined if no profile selected.
 */
const currentSongAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchCurrentSong(mpdClient, profile);
});

/**
 * Synchronized atom for current song state.
 *
 * Ensures consistent updates across all subscribers when
 * the current song changes.
 */
const currentSongSyncAtom = atomWithSync(currentSongAtom);

/**
 * Optimized current song atom with path-based comparison.
 *
 * Prevents unnecessary re-renders by comparing song file
 * paths instead of entire objects.
 */
const currentSongSyncWithCompareAtom = selectAtom<
	Song | undefined,
	Song | undefined
>(
	currentSongSyncAtom,
	(state, _prev) => state,
	(a, b) => a?.path === b?.path,
);

/**
 * Hook for accessing current song state.
 *
 * Provides read-only access to current song with optimized
 * updates. Auto-updates when playback changes.
 *
 * @returns Current song or undefined
 */
export function useCurrentSongState() {
	return useAtomValue(currentSongSyncWithCompareAtom);
}

/**
 * Hook for refreshing current song state.
 *
 * Returns function to trigger fresh fetch from MPD server.
 * Useful for manual refresh or error recovery.
 *
 * @returns Refresh function
 */
export function useRefreshCurrentSongState() {
	return useSetAtom(currentSongAtom);
}
