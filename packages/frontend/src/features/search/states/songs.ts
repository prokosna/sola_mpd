import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { ROUTE_HOME_SEARCH } from "../../../const/routes";
import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";
import { fetchSearchSongs } from "../helpers/api";

import { editingSearchAtom } from "./edit";

const targetSearchAtom = atom<Search | undefined>(undefined);

const searchSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const search = get(targetSearchAtom);

  if (currentMpdProfile === undefined || search === undefined) {
    return [];
  }

  return await fetchSearchSongs(mpdClient, currentMpdProfile, search);
});

const searchVisibleSongsAtom = atom(async (get) => {
  const searchSongs = await get(searchSongsAtom);
  const editingSearch = get(editingSearchAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_SEARCH) {
    return searchSongs;
  }

  const filteredSongs = filterSongsByGlobalFilter(
    searchSongs,
    globalFilterTokens,
    editingSearch.columns,
  );
  return filteredSongs;
});

const unwrappedSearchSongs = unwrap(
  searchVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useTargetSearchState() {
  return useAtomValue(targetSearchAtom);
}

export function useSetTargetSearchState() {
  return useSetAtom(targetSearchAtom);
}

export function useSearchVisibleSongsState() {
  return useAtomValue(unwrappedSearchSongs);
}

export function useRefreshSearchSongsState() {
  return useSetAtom(searchSongsAtom);
}
