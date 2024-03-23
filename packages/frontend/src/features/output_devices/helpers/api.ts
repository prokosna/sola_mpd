import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

export async function fetchOutputDevices(
  mpdClient: MpdClient,
  profile: MpdProfile,
) {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "outputs",
        value: {},
      },
    }),
  );
  if (res.command.case !== "outputs") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.devices;
}
