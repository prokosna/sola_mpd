import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAY_QUEUE } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchPlayQueueSongs } from "../utils/playQueueSongsUtils";

/**
 * Base atom for play queue songs.
 *
 * Fetches songs from MPD server when initialized or refreshed.
 * Requires an active profile and returns undefined when none
 * is selected.
 */
const playQueueSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  const songs = await fetchPlayQueueSongs(mpdClient, profile);

  return songs;
});

/**
 * Synchronized atom for play queue songs.
 *
 * Wraps base atom with synchronization to ensure consistent
 * updates across all subscribers when queue changes.
 */
const playQueueSongsSyncAtom = atomWithSync(playQueueSongsAtom);

/**
 * Derived atom for filtered play queue songs.
 *
 * Combines queue songs with global filter and route state
 * to provide a filtered view. Updates automatically when
 * dependencies change.
 */
const playQueueVisibleSongsSyncAtom = atom((get) => {
  const playQueueSongs = get(playQueueSongsSyncAtom);
  const songTableState = get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (
    pathname !== ROUTE_HOME_PLAY_QUEUE ||
    playQueueSongs === undefined ||
    songTableState === undefined
  ) {
    return undefined;
  }

  const filteredSongs = filterSongsByGlobalFilter(
    playQueueSongs,
    globalFilterTokens,
    songTableState.columns,
  );

  return filteredSongs;
});

/**
 * Hook for accessing filtered play queue songs.
 *
 * Provides read-only access to current queue songs with
 * global filter applied. Only available on play queue route.
 *
 * @returns Filtered songs array or undefined
 */
export function usePlayQueueSongsState() {
  return useAtomValue(playQueueVisibleSongsSyncAtom);
}

/**
 * Hook for refreshing play queue songs.
 *
 * Returns a function to trigger a fresh fetch from MPD server.
 * Useful after queue modifications or for manual updates.
 *
 * @returns Refresh function
 */
export function useRefreshPlayQueueSongsState() {
  return useSetAtom(playQueueSongsAtom);
}
