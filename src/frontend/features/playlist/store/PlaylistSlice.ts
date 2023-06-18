import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Playlist } from "@/models/playlist";
import { Song } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";

export type PlaylistSlice = {
  playlistSongs: Song[];
  currentPlaylist: Playlist | undefined;
  playlists: Playlist[];
  pullPlaylistSongs: (
    profile: MpdProfile,
    currentPlaylist: Playlist
  ) => Promise<void>;
  updateCurrentPlaylist: (playlist: Playlist) => Promise<void>;
  pullPlaylists: (profile: MpdProfile) => Promise<void>;
};

export const createPlaylistSlice: StateCreator<
  AllSlices,
  [],
  [],
  PlaylistSlice
> = (set, get) => ({
  playlistSongs: [],
  currentPlaylist: undefined,
  playlists: [],
  pullPlaylistSongs: async (profile: MpdProfile, currentPlaylist: Playlist) => {
    const req = MpdRequest.create({
      profile,
      command: {
        $case: "listplaylistinfo",
        listplaylistinfo: { name: currentPlaylist.name },
      },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "listplaylistinfo") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const songs = res.command.listplaylistinfo.songs;

    set({
      playlistSongs: songs,
    });
  },
  updateCurrentPlaylist: async (playlist: Playlist) => {
    if (playlist.name !== get().currentPlaylist?.name) {
      set({
        playlistSongs: [],
      });
    }
    set({
      currentPlaylist: playlist,
    });
  },
  pullPlaylists: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "listplaylists", listplaylists: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "listplaylists") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const playlists = res.command.listplaylists.playlists;

    if (playlists.every((v) => v.name !== get().currentPlaylist?.name)) {
      set({
        currentPlaylist: undefined,
        playlistSongs: [],
      });
    }
    set({
      playlists,
    });
  },
});
