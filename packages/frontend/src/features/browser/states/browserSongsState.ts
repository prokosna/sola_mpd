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

const browserSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileSyncAtom);
  const browserFilters = await get(browserFiltersSyncAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  const songs = await fetchBrowserSongs(
    mpdClient,
    currentMpdProfile,
    browserFilters,
  );

  return songs;
});

const browserSongsSyncAtom = atomWithSync(browserSongsAtom);

const browserVisibleSongsSyncAtom = atom(async (get) => {
  const browserSongs = await get(browserSongsSyncAtom);
  const songTableState = await get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_BROWSER) {
    return [];
  }

  const filteredSongs = filterSongsByGlobalFilter(
    browserSongs,
    globalFilterTokens,
    songTableState.columns,
  );

  return filteredSongs;
});

/**
 * Returns the visible songs of browser page.
 * If the current pathname is not browser, it returns no songs.
 * Otherwise, it filters the songs by global filter.
 */
export function useBrowserSongsState() {
  return useAtomValue(browserVisibleSongsSyncAtom);
}

/**
 * Returns a function to refresh the browser songs state.
 * This hook can be used to trigger a re-fetch of the browser songs.
 * @returns A function that, when called, will refresh the browser songs state.
 */
export function useRefreshBrowserSongsState() {
  return useSetAtom(browserSongsAtom);
}
