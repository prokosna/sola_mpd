import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useSetAtom } from "jotai";

import { publishCurrentMpdProfileChangedEventAtom } from "../atoms/profile";

export function useChangeMpdProfileAction() {
  const setCurrentMpdProfileChangedEvent = useSetAtom(
    publishCurrentMpdProfileChangedEventAtom,
  );

  return (mpdProfileState: MpdProfileState) => (name: string) => {
    const index = mpdProfileState.profiles.findIndex(
      (profile) => profile.name === name,
    );
    if (index < 0) {
      throw new Error(
        `Invalid profile state: ${name} not in ${mpdProfileState.toJsonString()}`,
      );
    }

    setCurrentMpdProfileChangedEvent(mpdProfileState.profiles[index]);
  };
}
