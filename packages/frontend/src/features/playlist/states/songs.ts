import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useEffect } from "react";

import { ROUTE_HOME_PLAYLIST } from "../../../const/routes";
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
import { fetchPlaylistSongs } from "../helpers/api";

import { selectedPlaylistAtom } from "./playlist";

const playlistSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const selectedPlaylist = get(selectedPlaylistAtom);

  if (currentMpdProfile === undefined || selectedPlaylist === undefined) {
    return [];
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const songs = await fetchPlaylistSongs(
    mpdClient,
    currentMpdProfile,
    selectedPlaylist,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Playlist",
    action: "Download",
    elapsedTimeMillisecond: end - start,
  });

  return songs;
});

const playlistVisibleSongsAtom = atom(async (get) => {
  const playlistSongs = await get(playlistSongsAtom);
  const songTableState = await get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_PLAYLIST) {
    return playlistSongs;
  }

  const metricsTracker = get(metricsTrackerAtom);
  const start = performance.now();
  const filteredSongs = filterSongsByGlobalFilter(
    playlistSongs,
    globalFilterTokens,
    songTableState.columns,
  );
  const end = performance.now();
  metricsTracker.appendMetric({
    page: "Playlist",
    action: "Filtering",
    elapsedTimeMillisecond: end - start,
  });

  return filteredSongs;
});

const unwrappedPlaylistVisibleSongsAtom = unwrap(
  playlistVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useRefreshPlaylistSongsState() {
  return useSetAtom(playlistSongsAtom);
}

export function usePlaylistVisibleSongsState() {
  const songs = useAtomValue(unwrappedPlaylistVisibleSongsAtom);
  const refreshMetrics = useRefreshMetrics();

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, songs]);

  return songs;
}
