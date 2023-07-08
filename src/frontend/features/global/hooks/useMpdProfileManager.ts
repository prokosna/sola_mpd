import { useCallback } from "react";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { MpdUtils } from "@/utils/MpdUtils";

export function useMpdProfileManager() {
  const checkMpdProfile = useCallback(
    async (profile: MpdProfile): Promise<string | undefined> => {
      const command = MpdRequest.create({
        profile,
        command: {
          $case: "ping",
          ping: {},
        },
      });
      try {
        const res = await MpdUtils.command(command);
        if (res.command?.$case !== "ping") {
          throw Error(`Invalid MPD response: ${res}`);
        }
        return res.command.ping.version;
      } catch (err) {
        console.error(err);
      }
      return undefined;
    },
    [],
  );

  return {
    checkMpdProfile,
  };
}
