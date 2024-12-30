import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
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

import { editingSearchAtom } from "./searchEditState";

const targetSearchAtom = atom<Search | undefined>(undefined);

const searchSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);
  const search = get(targetSearchAtom);

  if (profile === undefined || search === undefined) {
    return [];
  }

  const songs = await fetchSearchSongs(mpdClient, profile, search);

  return songs;
});

const searchSongsSyncAtom = atomWithSync(searchSongsAtom);

const searchVisibleSongsSyncAtom = atom((get) => {
  const searchSongs = get(searchSongsSyncAtom);
  const editingSearch = get(editingSearchAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_SEARCH || searchSongs === undefined) {
    return [];
  }

  const filteredSongs = filterSongsByGlobalFilter(
    searchSongs,
    globalFilterTokens,
    editingSearch.columns,
  );

  return filteredSongs;
});

/**
 * Hook to access the current target search state.
 * @returns The current target search state.
 */
export function useTargetSearchState() {
  return useAtomValue(targetSearchAtom);
}

/**
 * Hook to set the target search state.
 * @returns A function that updates the target search state.
 */
export function useSetTargetSearchState() {
  return useSetAtom(targetSearchAtom);
}

/**
 * Hook to access the current visible songs state for search.
 * This hook retrieves the filtered songs based on the global filter
 * and the current route (only for search).
 * @returns An array of filtered Song objects.
 */
export function useSearchSongsState() {
  return useAtomValue(searchVisibleSongsSyncAtom);
}

/**
 * Hook to refresh the search songs state.
 * This triggers a re-fetch of the search songs.
 * @returns A function that, when called, will refresh the search songs state.
 */
export function useRefreshSearchSongsState() {
  return useSetAtom(searchSongsAtom);
}
