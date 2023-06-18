import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import {
  BrowserSlice,
  createBrowserSlice,
} from "../../browser/store/BrowserSlice";
import {
  FileExploreSlice,
  createFileExploreSlice,
} from "../../file_explore/store/FileExploreSlice";
import {
  GlobalFilterSlice,
  createGlobalFilterSlice,
} from "../../global_filter/store/GlobalFilterSlice";
import {
  PlayQueueSlice,
  createPlayQueueSlice,
} from "../../play_queue/store/PlayQueueSlice";
import { PlayerSlice, createPlayerSlice } from "../../player/store/PlayerSlice";
import {
  PlaylistSlice,
  createPlaylistSlice,
} from "../../playlist/store/PlaylistSlice";
import { PluginSlice, createPluginSlice } from "../../plugin/store/PluginSlice";
import {
  ProfileSlice,
  createProfileSlice,
} from "../../profile/store/ProfileSlice";
import { SearchSlice, createSearchSlice } from "../../search/store/SearchSlice";

import { LayoutSlice, createLayoutSlice } from "./LayoutSlice";
import { MpdStatsSlice, createMpdStatsSlice } from "./MpdStatsSlice";
import {
  SelectedSongsSlice,
  createSelectedSongsSlice,
} from "./SelectedSongsSlice";
import { SystemSlice, createSystemSlice } from "./SystemSlice";
import { WebSocketSlice, createWebSocketSlice } from "./WebSocketSlice";

export type AllSlices = LayoutSlice &
  WebSocketSlice &
  MpdStatsSlice &
  SystemSlice &
  BrowserSlice &
  PlayQueueSlice &
  PlayerSlice &
  PlaylistSlice &
  ProfileSlice &
  GlobalFilterSlice &
  SelectedSongsSlice &
  FileExploreSlice &
  SearchSlice &
  PluginSlice;

export const useAppStore = create<AllSlices>()(
  devtools(
    subscribeWithSelector((...a) => ({
      ...createLayoutSlice(...a),
      ...createWebSocketSlice(...a),
      ...createMpdStatsSlice(...a),
      ...createSystemSlice(...a),
      ...createBrowserSlice(...a),
      ...createPlayQueueSlice(...a),
      ...createPlayerSlice(...a),
      ...createPlaylistSlice(...a),
      ...createProfileSlice(...a),
      ...createGlobalFilterSlice(...a),
      ...createSelectedSongsSlice(...a),
      ...createFileExploreSlice(...a),
      ...createSearchSlice(...a),
      ...createPluginSlice(...a),
    }))
  )
);

// Initialize things unrelated to the front end
// React useEffect() should be used only for UI components
async function initialize() {
  await useAppStore.getState().pullProfileState();
  await useAppStore.getState().pullLayoutState();
  await useAppStore.getState().pullCommonSongTableState();
  useAppStore.subscribe(
    (state) => state.profileState?.currentProfile,
    (profile, prevProfile) => {
      if (profile === undefined) {
        return;
      }
      if (profile !== prevProfile) {
        useAppStore.getState().refreshWebSocket(profile);
      }
    },
    { fireImmediately: true }
  );
}

// Initialize only on the client side
if (typeof window !== "undefined") {
  initialize();
}
