import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Fetches the output devices from the MPD server.
 *
 * @param mpdClient - The MPD client instance used to send commands.
 * @param profile - The MPD profile containing connection details.
 * @returns A Promise that resolves to an array of output devices.
 * @throws Error if the MPD response is invalid.
 */
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
