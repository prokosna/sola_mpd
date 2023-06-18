import { io } from "socket.io-client";
import { StateCreator } from "zustand";

import { AppMessageLevel } from "../types/AppMessage";

import { AllSlices } from "./AppStore";

import {
  ENDPOINT_MPD_CONNECT,
  WS_MESSAGE,
  WS_MPD_EVENT,
  WS_MPD_SUBSCRIBE,
} from "@/const";
import { MpdEvent, MpdEventEventType } from "@/models/mpd/mpd_event";
import { MpdProfile } from "@/models/mpd/mpd_profile";

export type WebSocketSlice = {
  socket: ReturnType<typeof io> | undefined;
  refreshWebSocket: (profile: MpdProfile) => void;
};

export const createWebSocketSlice: StateCreator<
  AllSlices,
  [],
  [],
  WebSocketSlice
> = (set, get) => ({
  socket: undefined,
  refreshWebSocket: async (profile: MpdProfile) => {
    if (get().socket !== undefined) {
      if (!get().socket?.disconnected) {
        get().socket?.disconnect();
      }
      set({
        socket: undefined,
      });
    }

    fetch(ENDPOINT_MPD_CONNECT);
    const socket = io();

    socket.on("connect", () => {
      socket.emit(WS_MPD_SUBSCRIBE, JSON.stringify(MpdProfile.toJSON(profile)));
    });

    const lastInvokedAt: Map<MpdEventEventType, Date> = new Map();

    socket.on(WS_MPD_EVENT, async (event) => {
      try {
        const mpdEvent = MpdEvent.fromJSON(JSON.parse(event));

        // Suppress too many calls
        const now = new Date();
        if (!lastInvokedAt.has(mpdEvent.eventType)) {
          lastInvokedAt.set(mpdEvent.eventType, now);
        }
        const last = lastInvokedAt.get(mpdEvent.eventType);
        const elapsed = now.getTime() - last!.getTime();
        // Did not work well
        if (elapsed < 0) {
          return;
        }
        lastInvokedAt.set(mpdEvent.eventType, now);

        switch (mpdEvent.eventType) {
          case MpdEventEventType.DATABASE:
          case MpdEventEventType.UPDATE:
            get().pullMpdStats(profile);
            get().pullCurrentSong(profile);
            get().pullMpdPlayerStatus(profile);
            break;
          case MpdEventEventType.PLAYLIST:
            get().pullPlaylists(profile);
            const playlist = get().currentPlaylist;
            if (playlist !== undefined) {
              get().pullPlaylistSongs(profile, playlist);
            }
            break;
          case MpdEventEventType.PLAY_QUEUE:
            get().pullPlayQueueSongs(profile);
            get().pullCurrentSong(profile);
            get().pullMpdPlayerStatus(profile);
            break;
          case MpdEventEventType.MIXER:
            get().pullMpdPlayerVolume(profile);
          case MpdEventEventType.OPTIONS:
          case MpdEventEventType.PLAYER:
            get().pullCurrentSong(profile);
            get().pullMpdPlayerStatus(profile);
            break;
          case MpdEventEventType.DISCONNECTED:
            break;
        }
      } catch (err) {
        const appMessage = {
          message: `${err}`,
          level: AppMessageLevel.ERROR,
        };
        get().updateAppMessage(appMessage);
      }
    });

    socket.on(WS_MESSAGE, (message) => {
      const appMessage = {
        message: `${message}`,
        level: AppMessageLevel.WARN,
      };
      get().updateAppMessage(appMessage);
    });

    set({
      socket: socket,
    });
  },
});
