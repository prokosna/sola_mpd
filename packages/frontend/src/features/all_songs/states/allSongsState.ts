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

const allSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  const songs = await fetchAllSongs(mpdClient, profile);

  return songs;
});

export const allSongsSyncAtom = atomWithSync(allSongsAtom);

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
 * Hook to access the visible songs state for all songs.
 * This hook retrieves the filtered songs based on the global filter
 * and the current route (only for full text search).
 * @returns An array of filtered Song objects.
 */
export function useAllSongsState() {
  return useAtomValue(allSongsVisibleSongsSyncAtom);
}

/**
 * Returns a function to refresh the all songs state.
 * This hook can be used to trigger a re-fetch of all songs.
 * @returns A function that, when called, will refresh the all songs state.
 */
export function useRefreshAllSongsState() {
  return useSetAtom(allSongsAtom);
}
