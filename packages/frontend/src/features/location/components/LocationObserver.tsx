import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  ROUTE_HOME_PLAYLIST,
  ROUTE_HOME_PLAY_QUEUE,
} from "../../../const/routes";
import { useRefreshPlayQueueSongsState } from "../../play_queue";
import { useRefreshPlaylistsState } from "../../playlist";
import { useSetSelectedSongsState } from "../../song_table";
import { pathnameAtom } from "../states/location";

export function LocationObserver() {
  const location = useLocation();
  const setPathname = useSetAtom(pathnameAtom);
  const setSelectedSongs = useSetSelectedSongsState();
  const refreshPlaylistsState = useRefreshPlaylistsState();
  const refreshPlayQueueSongsState = useRefreshPlayQueueSongsState();

  useEffect(() => {
    setPathname(location.pathname);

    // When user moves to a different page, selected songs should be reset.
    setSelectedSongs([]);

    if (location.pathname === ROUTE_HOME_PLAYLIST) {
      refreshPlaylistsState();
    }

    if (location.pathname === ROUTE_HOME_PLAY_QUEUE) {
      refreshPlayQueueSongsState();
    }
  }, [
    location.pathname,
    refreshPlayQueueSongsState,
    refreshPlaylistsState,
    setPathname,
    setSelectedSongs,
  ]);

  return undefined;
}
