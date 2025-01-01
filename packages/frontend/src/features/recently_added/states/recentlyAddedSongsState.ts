import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchRecentlyAddedSongs } from "../utils/recentlyAddedSongsUtils";

import {
  recentlyAddedFiltersSyncAtom,
  recentlyAddedSelectedFilterValuesAtom,
} from "./recentlyAddedFiltersState";

const recentlyAddedSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const currentMpdProfile = get(currentMpdProfileSyncAtom);
  const recentlyAddedFilters = get(recentlyAddedFiltersSyncAtom);
  const selectedFilterValuesMap = get(recentlyAddedSelectedFilterValuesAtom);

  if (currentMpdProfile === undefined || recentlyAddedFilters === undefined) {
    return undefined;
  }

  const songs = await fetchRecentlyAddedSongs(
    mpdClient,
    currentMpdProfile,
    recentlyAddedFilters,
    selectedFilterValuesMap,
  );

  return songs;
});

const recentlyAddedSongsSyncAtom = atomWithSync(recentlyAddedSongsAtom);

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
 * Returns the visible songs of recently added page.
 * If the current pathname is not recently added, it returns no songs.
 * Otherwise, it filters the songs by global filter.
 */
export function useRecentlyAddedSongsState() {
  return useAtomValue(recentlyAddedVisibleSongsSyncAtom);
}

/**
 * Returns a function to refresh the recently added songs state.
 * This hook can be used to trigger a re-fetch of the recently added songs.
 * @returns A function that, when called, will refresh the recently added songs state.
 */
export function useRefreshRecentlyAddedSongsState() {
  return useSetAtom(recentlyAddedSongsAtom);
}
