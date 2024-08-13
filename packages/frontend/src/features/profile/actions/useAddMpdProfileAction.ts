import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useSetAtom } from "jotai";

import { publishMpdProfileStateChangedEventAtom } from "../atoms/profile";
import { MpdProfileInput } from "../types/profileInput";

export function useAddMpdProfileAction() {
  const setMpdProfileStateChangedEvent = useSetAtom(
    publishMpdProfileStateChangedEventAtom,
  );

  return (mpdProfileState: MpdProfileState) =>
    async (mpdProfileInput: MpdProfileInput) => {
      const profile = new MpdProfile({
        name: mpdProfileInput.name,
        host: mpdProfileInput.host,
        port: mpdProfileInput.port,
      });

      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.profiles.push(profile);
      if (newMpdProfileState.currentProfile === undefined) {
        newMpdProfileState.currentProfile = profile;
      }

      await setMpdProfileStateChangedEvent(newMpdProfileState);
    };
}
