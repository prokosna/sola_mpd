import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { compareVersions } from "compare-versions";
import { useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { useMpdProfileState } from "../states/mpdProfileState";
import { ProfileInputs } from "../types/profileInputs";

export function useValidateMpdProfile() {
  const mpdClient = useMpdClientState();
  const mpdProfileState = useMpdProfileState();

  return useCallback(
    async (inputs: ProfileInputs) => {
      if (mpdClient === undefined) {
        return "MpdClient is not ready. Please make sure the background app is running.";
      }

      if (
        mpdProfileState?.profiles
          .map((profile) => profile.name)
          .includes(inputs.name)
      ) {
        return `${inputs.name} is already used.`;
      }

      try {
        const res = await mpdClient.command(
          new MpdRequest({
            profile: new MpdProfile({
              name: inputs.name,
              host: inputs.host,
              port: inputs.port,
            }),
            command: {
              case: "ping",
              value: {},
            },
          }),
        );

        if (res.command.case !== "ping") {
          return `Invalid MPD response: ${res}`;
        }

        const version = res.command.value.version;
        if (compareVersions(version, "0.21") < 0) {
          return `MPD version is ${version}: Please use 0.21 or later.`;
        }

        return undefined;
      } catch (err) {
        return String(err);
      }
    },
    [mpdClient, mpdProfileState?.profiles],
  );
}
