import { MpdEvent_EventType } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { useEffect } from "react";

import { useRefreshPlayQueueSongsState } from "../../play_queue";
import { useRefreshPlayerVolumeState } from "../../player";
import {
  useRefreshPlaylistsState,
  useRefreshPlaylistSongsState,
} from "../../playlist";
import { useCurrentMpdProfileState } from "../../profile";
import { useRefreshStatsState } from "../../stats";
import { useMpdListenerState } from "../states/mpdListener";

export function MpdEventObserver() {
  const mpdListener = useMpdListenerState();
  const profile = useCurrentMpdProfileState();
  const refreshStats = useRefreshStatsState();
  const refreshPlayQueueSongs = useRefreshPlayQueueSongsState();
  const refreshPlaylists = useRefreshPlaylistsState();
  const refreshPlaylistSongs = useRefreshPlaylistSongsState();
  const refreshPlayerVolume = useRefreshPlayerVolumeState();

  useEffect(() => {
    if (profile === undefined) {
      return;
    }

    mpdListener.on(MpdEvent_EventType.DATABASE, () => {
      refreshStats();
    });
    mpdListener.on(MpdEvent_EventType.UPDATE, () => {
      refreshStats();
    });
    mpdListener.on(MpdEvent_EventType.PLAYLIST, () => {
      refreshPlaylists();
      refreshPlaylistSongs();
    });
    mpdListener.on(MpdEvent_EventType.PLAY_QUEUE, () => {
      refreshPlayQueueSongs();
    });
    mpdListener.on(MpdEvent_EventType.MIXER, () => {
      refreshPlayerVolume();
    });
    mpdListener.on(MpdEvent_EventType.OPTIONS, () => {});
    mpdListener.on(MpdEvent_EventType.PLAYER, () => {});
    mpdListener.on(MpdEvent_EventType.DISCONNECTED, () => {});
    mpdListener.subscribe(profile);

    return () => {
      mpdListener.unsubscribe(profile);
    };
  }, [
    mpdListener,
    profile,
    refreshPlayQueueSongs,
    refreshPlayerVolume,
    refreshPlaylistSongs,
    refreshPlaylists,
    refreshStats,
  ]);

  return undefined;
}
