import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Fetch current song from MPD server.
 *
 * Gets song details including file path, metadata, and queue
 * information via currentsong command.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @returns Current song or undefined
 */
export async function fetchCurrentSong(
  mpdClient: MpdClient,
  profile: MpdProfile,
) {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "currentsong",
        value: {},
      },
    }),
  );
  if (res.command.case !== "currentsong") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.song;
}

/**
 * Fetch player status from MPD server.
 *
 * Gets playback state, modes (repeat, random, etc.), and
 * timing information via status command.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @returns Player status
 */
export async function fetchPlayerStatus(
  mpdClient: MpdClient,
  profile: MpdProfile,
) {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "status",
        value: {},
      },
    }),
  );
  if (res.command.case !== "status") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.status;
}

/**
 * Fetch volume level from MPD server.
 *
 * Gets volume (0-100) via status command. Returns undefined
 * if volume control is not available.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @returns Volume level or undefined
 */
export async function fetchPlayerVolume(
  mpdClient: MpdClient,
  profile: MpdProfile,
) {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "getvol",
        value: {},
      },
    }),
  );
  if (res.command.case !== "getvol") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.vol;
}
