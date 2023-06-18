import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { ENDPOINT_APP_MPD_PROFILE_STATE } from "@/const";
import { MpdProfileState } from "@/models/mpd/mpd_profile";
import { ApiUtils } from "@/utils/ApiUtils";

export type ProfileSlice = {
  profileState: MpdProfileState | undefined;
  pullProfileState: () => Promise<void>;
  updateProfileState: (profileState: MpdProfileState) => Promise<void>;
};

export const createProfileSlice: StateCreator<
  AllSlices,
  [],
  [],
  ProfileSlice
> = (set, get) => ({
  profileState: undefined,
  pullProfileState: async () => {
    const profileState = await ApiUtils.get<MpdProfileState>(
      ENDPOINT_APP_MPD_PROFILE_STATE,
      MpdProfileState
    );
    set({
      profileState,
    });
  },
  updateProfileState: async (profileState: MpdProfileState) => {
    if (get().profileState === undefined) {
      await get().pullProfileState();
    }

    await ApiUtils.post<MpdProfileState>(
      ENDPOINT_APP_MPD_PROFILE_STATE,
      MpdProfileState,
      profileState
    );

    set({
      profileState,
    });
  },
});
