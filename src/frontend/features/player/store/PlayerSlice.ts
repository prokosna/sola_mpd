import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdPlayerStatus, MpdPlayerVolume } from "@/models/mpd/mpd_player";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Song } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";

export type PlayerSlice = {
  currentSong: Song | undefined;
  mpdPlayerStatus: MpdPlayerStatus | undefined;
  mpdPlayerVolume: MpdPlayerVolume | undefined;
  pullCurrentSong: (profile: MpdProfile) => Promise<void>;
  pullMpdPlayerStatus: (profile: MpdProfile) => Promise<void>;
  pullMpdPlayerVolume: (profile: MpdProfile) => Promise<void>;
};

export const createPlayerSlice: StateCreator<AllSlices, [], [], PlayerSlice> = (
  set,
) => ({
  currentSong: undefined,
  mpdPlayerStatus: undefined,
  mpdPlayerVolume: undefined,
  pullCurrentSong: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "currentsong", currentsong: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "currentsong") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const song = res.command.currentsong.song;

    set({
      currentSong: song,
    });
  },
  pullMpdPlayerStatus: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "status", status: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "status") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const status = res.command.status.status;

    set({
      mpdPlayerStatus: status,
    });
  },
  pullMpdPlayerVolume: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "getvol", getvol: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "getvol") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const vol = res.command.getvol.vol;

    set({
      mpdPlayerVolume: vol,
    });
  },
});
