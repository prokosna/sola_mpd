import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { compareVersions } from "compare-versions";

import { MpdVersion } from "../../mpd/MpdService";
import { MpdProfileInput } from "../types/profileInput";

export type MpdProfileValidationResult = {
  isOk: boolean;
  error?: string;
};

export const validateMpdProfileInputs =
  (
    pingMpd: (host: string, port: number) => Promise<MpdVersion>,
    mpdProfileState: MpdProfileState,
  ) =>
  async (
    mpdProfileInput: MpdProfileInput,
  ): Promise<MpdProfileValidationResult> => {
    if (
      mpdProfileState?.profiles
        .map((profile) => profile.name)
        .includes(mpdProfileInput.name)
    ) {
      return {
        isOk: false,
        error: `${mpdProfileInput.name} is already used.`,
      };
    }

    try {
      const version = await pingMpd(mpdProfileInput.host, mpdProfileInput.port);
      if (compareVersions(version, "0.21") < 0) {
        return {
          isOk: false,
          error: `MPD version is ${version}: Only 0.21 or later is supported.`,
        };
      }
    } catch (err) {
      return {
        isOk: false,
        error: String(err),
      };
    }

    return {
      isOk: true,
    };
  };
