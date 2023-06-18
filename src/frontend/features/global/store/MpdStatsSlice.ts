import { StateCreator } from "zustand";

import { AllSlices } from "./AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdOutputDevice } from "@/models/mpd/mpd_output";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { MpdStats } from "@/models/mpd/mpd_stats";
import { MpdUtils } from "@/utils/MpdUtils";

export type MpdStatsSlice = {
  mpdStats: MpdStats | undefined;
  mpdDevices: MpdOutputDevice[] | undefined;
  pullMpdStats: (profile: MpdProfile) => Promise<void>;
  pullMpdDevices: (profile: MpdProfile) => Promise<void>;
};

export const createMpdStatsSlice: StateCreator<
  AllSlices,
  [],
  [],
  MpdStatsSlice
> = (set, get) => ({
  mpdStats: undefined,
  mpdDevices: undefined,
  pullMpdStats: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "stats", stats: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "stats") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const stats = res.command.stats.stats;

    set({
      mpdStats: stats,
    });
  },
  pullMpdDevices: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "outputs", outputs: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "outputs") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const devices = res.command.outputs.devices;

    set({
      mpdDevices: devices,
    });
  },
});
