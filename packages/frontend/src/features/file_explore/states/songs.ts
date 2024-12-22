import { atom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_FILE_EXPLORE } from "../../../const/routes";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import {
  metricsTrackerAtom,
  useRefreshMetrics,
} from "../../metrics/states/tracker";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchFileExploreSongs } from "../helpers/api";

import { selectedFileExploreFolderAtom } from "./folders";

const fileExploreSongsAtom = atom(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const selectedFileExploreFolder = get(selectedFileExploreFolderAtom);

  if (
    currentMpdProfile === undefined ||
    selectedFileExploreFolder === undefined
  ) {
    return [];
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchFileExploreSongs(
    mpdClient,
    currentMpdProfile,
    selectedFileExploreFolder,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "File Explore",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const fileExploreVisibleSongsAtom = atom(async (get) => {
  const fileExploreSongs = await get(fileExploreSongsAtom);
  const songTableState = await get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_FILE_EXPLORE) {
    return fileExploreSongs.toSorted((a, b) => (a.path > b.path ? 1 : -1));
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    fileExploreSongs,
    globalFilterTokens,
    songTableState.columns,
  );
  const sortedSongs = filteredSongs.toSorted((a, b) =>
    a.path > b.path ? 1 : -1,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "File Explore",
    action: "Filtering",
    elapsedTimeMillisecond: end - start,
  });

  return sortedSongs;
});

const unwrappedFileExploreVisibleSongsAtom = unwrap(
  fileExploreVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useFileExploreVisibleSongsState() {
  const songs = useAtomValue(unwrappedFileExploreVisibleSongsAtom);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}
