import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useAtomValue } from "jotai";

import { mpdServiceAtom } from "../../mpd";
import { MpdProfileInput } from "../types/profileTypes";
import {
  MpdProfileValidationResult,
  validateMpdProfileInputs,
} from "../workflows/validateMpdProfileInputs";

export function useValidateMpdProfileInputsAction() {
  const pingMpd = useAtomValue(mpdServiceAtom).pingMpd;

  return (mpdProfileState: MpdProfileState) =>
    (mpdProfileInput: MpdProfileInput): Promise<MpdProfileValidationResult> => {
      return validateMpdProfileInputs(
        pingMpd,
        mpdProfileState,
      )(mpdProfileInput);
    };
}
