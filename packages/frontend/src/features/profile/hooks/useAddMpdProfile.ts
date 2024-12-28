import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useMpdProfileState,
  useUpdateMpdProfileState,
} from "../states/mpdProfileState";
import { ProfileInput } from "../types/profileTypes";

/**
 * Custom hook for adding a new MPD profile.
 * @returns A function that takes a ProfileInput and adds it to the MPD profile state.
 * @throws Error if the MpdProfileState is not ready.
 */
export function useAddMpdProfile() {
  const mpdProfileState = useMpdProfileState();
  const updateMpdProfileState = useUpdateMpdProfileState();

  return useCallback(
    async (input: ProfileInput) => {
      if (mpdProfileState === undefined) {
        throw Error("MpdProfileState is not ready.");
      }

      const profile = new MpdProfile({
        name: input.name,
        host: input.host,
        port: input.port,
      });

      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.profiles.push(profile);
      if (newMpdProfileState.currentProfile === undefined) {
        newMpdProfileState.currentProfile = profile;
      }

      return updateMpdProfileState(
        newMpdProfileState,
        UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
      );
    },
    [mpdProfileState, updateMpdProfileState],
  );
}
