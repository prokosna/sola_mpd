import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_PLAY_QUEUE } from "../../../const/routes";
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
import { fetchPlayQueueSongs } from "../helpers/api";

const playQueueSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchPlayQueueSongs(mpdClient, currentMpdProfile);
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Play Queue",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const playQueueVisibleSongsAtom = atom(async (get) => {
  const playQueueSongs = await get(playQueueSongsAtom);
  const commonSongTableState = await get(commonSongTableStateAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_PLAY_QUEUE) {
    return playQueueSongs;
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    playQueueSongs,
    globalFilterTokens,
    commonSongTableState.columns,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Play Queue",
    action: "Filtering",
    elapsedTimeMillisecond: end - start,
  });

  return filteredSongs;
});

const unwrappedPlayQueueVisibleSongsAtom = unwrap(
  playQueueVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function usePlayQueueVisibleSongsState() {
  return useAtomValue(unwrappedPlayQueueVisibleSongsAtom);
}

export function useRefreshPlayQueueSongsState() {
  const songs = useSetAtom(playQueueSongsAtom);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}
