import {
  SIO_MPD_EVENT,
  SIO_MPD_SUBSCRIBE,
} from "@sola_mpd/domain/src/const/socketio.js";
import {
  MpdEvent,
  MpdEvent_EventType,
} from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { useEffect } from "react";

import { useRefreshPlayQueueSongsState } from "../../play_queue";
import { useRefreshPlayerVolumeState } from "../../player";
import {
  useRefreshPlaylistsState,
  useRefreshPlaylistSongsState,
} from "../../playlist";
import { useCurrentMpdProfileState } from "../../profile";
import { useSocketState, SocketIoClientUtils } from "../../socketio";
import { useRefreshStatsState } from "../../stats";

export function MpdEventObserver() {
  const socket = useSocketState();
  const profile = useCurrentMpdProfileState();
  const refreshStats = useRefreshStatsState();
  const refreshPlayQueueSongs = useRefreshPlayQueueSongsState();
  const refreshPlaylists = useRefreshPlaylistsState();
  const refreshPlaylistSongs = useRefreshPlaylistSongsState();
  const refreshPlayerVolume = useRefreshPlayerVolumeState();

  useEffect(() => {
    if (socket === undefined || profile === undefined) {
      return;
    }

    socket.on(SIO_MPD_EVENT, (msg: string) => {
      const event = MpdEvent.fromJsonString(msg);
      console.info(`MPD event: ${MpdEvent_EventType[event.eventType]}`);

      switch (event.eventType) {
        case MpdEvent_EventType.DATABASE:
          refreshStats();
          break;
        case MpdEvent_EventType.UPDATE:
          refreshStats();
          break;
        case MpdEvent_EventType.PLAYLIST:
          refreshPlaylists();
          refreshPlaylistSongs();
          break;
        case MpdEvent_EventType.PLAY_QUEUE:
          refreshPlayQueueSongs();
          break;
        case MpdEvent_EventType.MIXER:
          refreshPlayerVolume();
          break;
        case MpdEvent_EventType.OPTIONS:
          break;
        case MpdEvent_EventType.PLAYER:
          break;
        case MpdEvent_EventType.DISCONNECTED:
          break;
      }
    });

    SocketIoClientUtils.emit(socket, SIO_MPD_SUBSCRIBE, profile.toBinary());

    return () => {
      socket.off(SIO_MPD_EVENT);
    };
  }, [
    profile,
    refreshPlayQueueSongs,
    refreshPlayerVolume,
    refreshPlaylistSongs,
    refreshPlaylists,
    refreshStats,
    socket,
  ]);

  return undefined;
}
