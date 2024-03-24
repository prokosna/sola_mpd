import { atom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_BROWSER } from "../../../const/routes";
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
import { commonSongTableStateAtom } from "../../song_table/states/commonSongTableState";
import { fetchBrowserSongs } from "../helpers/api";

import { browserFiltersAtom } from "./filters";

const browserSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const browserFilters = await get(browserFiltersAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchBrowserSongs(
    mpdClient,
    currentMpdProfile,
    browserFilters,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Browser",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const browserVisibleSongsAtom = atom(async (get) => {
  const browserSongs = await get(browserSongsAtom);
  const commonSongTableState = await get(commonSongTableStateAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_BROWSER) {
    return browserSongs;
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    browserSongs,
    globalFilterTokens,
    commonSongTableState.columns,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Browser",
    action: "Filtering",
    elapsedTimeMillisecond: end - start,
  });

  return filteredSongs;
});

const unwrappedBrowserVisibleSongsAtom = unwrap(
  browserVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useBrowserVisibleSongsState() {
  const songs = useAtomValue(unwrappedBrowserVisibleSongsAtom);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}
