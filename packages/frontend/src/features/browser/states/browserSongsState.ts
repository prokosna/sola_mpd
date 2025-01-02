import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_BROWSER } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchBrowserSongs } from "../utils/browserSongsUtils";

import { browserFiltersSyncAtom } from "./browserFiltersState";

/**
 * Base atom for storing browser songs.
 * Automatically refreshes when MPD client, profile, or filters change.
 */
const browserSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const currentMpdProfile = get(currentMpdProfileSyncAtom);
  const browserFilters = get(browserFiltersSyncAtom);

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
 * Synchronized atom for browser songs with persistence support.
 */
const browserSongsSyncAtom = atomWithSync(browserSongsAtom);

/**
 * Derived atom that filters songs based on global filter and current route.
 * Only returns songs when on the browser route.
 */
const browserVisibleSongsSyncAtom = atom((get) => {
  const browserSongs = get(browserSongsSyncAtom);
  const songTableState = get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (
    pathname !== ROUTE_HOME_BROWSER ||
    browserSongs === undefined ||
    songTableState === undefined
  ) {
    return undefined;
  }

  const filteredSongs = filterSongsByGlobalFilter(
    browserSongs,
    globalFilterTokens,
    songTableState.columns,
  );

  return filteredSongs;
});

/**
 * Hook to access the filtered songs in the browser view.
 *
 * Features:
 * - Route-aware filtering (only active in browser view)
 * - Global filter integration
 * - Automatic updates on filter changes
 *
 * @returns Filtered array of songs or undefined if not in browser view
 */
export function useBrowserSongsState() {
  return useAtomValue(browserVisibleSongsSyncAtom);
}

/**
 * Hook to refresh browser songs data from the MPD server.
 *
 * @returns Refresh function that triggers a new fetch
 */
export function useRefreshBrowserSongsState() {
  return useSetAtom(browserSongsAtom);
}
