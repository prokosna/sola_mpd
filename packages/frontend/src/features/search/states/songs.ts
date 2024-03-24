import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_SEARCH } from "../../../const/routes";
import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import {
  metricsTrackerAtom,
  useRefreshMetrics,
} from "../../metrics/states/tracker";
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

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchSearchSongs(mpdClient, currentMpdProfile, search);
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Search",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const searchVisibleSongsAtom = atom(async (get) => {
  const searchSongs = await get(searchSongsAtom);
  const editingSearch = get(editingSearchAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_SEARCH) {
    return searchSongs;
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    searchSongs,
    globalFilterTokens,
    editingSearch.columns,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Search",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

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
  const songs = useAtomValue(unwrappedSearchSongs);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}

export function useRefreshSearchSongsState() {
  return useSetAtom(searchSongsAtom);
}
