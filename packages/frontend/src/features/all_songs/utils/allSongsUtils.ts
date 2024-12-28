import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Fetches all songs from the MPD server.
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param mpdProfile - The MPD profile containing connection details.
 * @returns A promise that resolves to an array of Song objects.
 * @throws Error if the MPD response is invalid.
 */
export async function fetchAllSongs(
  mpdClient: MpdClient,
  mpdProfile: MpdProfile,
) {
  const req = new MpdRequest({
    profile: mpdProfile,
    command: { case: "listAllSongs", value: {} },
  });
  const res = await mpdClient.command(req);
  if (res.command.case !== "listAllSongs") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.songs;
}
