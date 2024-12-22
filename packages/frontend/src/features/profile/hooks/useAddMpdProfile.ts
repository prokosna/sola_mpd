import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";

import {
  useMpdProfileState,
  useSetMpdProfileState,
} from "../states/mpdProfileState";
import { ProfileInputs } from "../types/profileInputs";

export function useAddMpdProfile() {
  const mpdProfileState = useMpdProfileState();
  const setMpdProfileState = useSetMpdProfileState();

  return useCallback(
    async (inputs: ProfileInputs) => {
      if (mpdProfileState === undefined) {
        throw Error("MpdProfileState is not ready.");
      }

      const profile = new MpdProfile({
        name: inputs.name,
        host: inputs.host,
        port: inputs.port,
      });

      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.profiles.push(profile);
      if (newMpdProfileState.currentProfile === undefined) {
        newMpdProfileState.currentProfile = profile;
      }

      return setMpdProfileState(newMpdProfileState);
    },
    [mpdProfileState, setMpdProfileState],
  );
}
