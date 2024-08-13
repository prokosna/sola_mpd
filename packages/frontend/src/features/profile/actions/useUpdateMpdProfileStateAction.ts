import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useSetAtom } from "jotai";

import { publishMpdProfileStateChangedEventAtom } from "../atoms/profile";

export function useUpdateMpdProfileStateAction() {
  const publishMpdProfileStateChangedEvent = useSetAtom(
    publishMpdProfileStateChangedEventAtom,
  );

  return async (mpdProfileState: MpdProfileState) => {
    await publishMpdProfileStateChangedEvent(mpdProfileState);
  };
}
