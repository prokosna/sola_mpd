import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_FULL_TEXT_SEARCH } from "../../../const/routes";
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
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchAllSongs } from "../helpers/api";

const fullTextSearchSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchAllSongs(mpdClient, currentMpdProfile);
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Full Text Search",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const fullTextSearchVisibleSongsAtom = atom(async (get) => {
  const fullTextSearchSongs = await get(fullTextSearchSongsAtom);
  const songTableState = await get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_FULL_TEXT_SEARCH) {
    return fullTextSearchSongs;
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    fullTextSearchSongs,
    globalFilterTokens,
    songTableState.columns,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Full Text Search",
    action: "Filtering",
    elapsedTimeMillisecond: end - start,
  });

  return filteredSongs;
});

const unwrappedFullTextSearchVisibleSongsAtom = unwrap(
  fullTextSearchVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useRefreshFullTextSearchSongsState() {
  return useSetAtom(fullTextSearchSongsAtom);
}

export function useFullTextSearchVisibleSongsState() {
  const songs = useAtomValue(unwrappedFullTextSearchVisibleSongsAtom);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}
