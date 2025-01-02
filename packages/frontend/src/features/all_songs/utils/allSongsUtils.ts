import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Fetches all songs from the MPD server using the listAllSongs command.
 *
 * @param mpdClient - MPD client instance for server communication
 * @param mpdProfile - Profile containing server connection details
 * @returns Promise resolving to array of Song objects from the server
 * @throws {Error} When:
 *   - Server connection fails
 *   - Response command type doesn't match listAllSongs
 *   - Response format is invalid
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
