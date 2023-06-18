import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Song } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";

export type PlayQueueSlice = {
  playQueueSongs: Song[];
  pullPlayQueueSongs: (profile: MpdProfile) => Promise<void>;
};

export const createPlayQueueSlice: StateCreator<
  AllSlices,
  [],
  [],
  PlayQueueSlice
> = (set) => ({
  playQueueSongs: [],
  pullPlayQueueSongs: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "playlistinfo", playlistinfo: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "playlistinfo") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const songs = res.command.playlistinfo.songs;

    set({
      playQueueSongs: songs,
    });
  },
});
