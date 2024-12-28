import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Fetches the current song from the MPD server.
 * @param mpdClient The MPD client instance.
 * @param profile The MPD profile.
 * @returns A Promise that resolves to the current song.
 * @throws Error if the MPD response is invalid.
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
 * Fetches the current player status from the MPD server.
 * @param mpdClient The MPD client instance.
 * @param profile The MPD profile.
 * @returns A Promise that resolves to the player status.
 * @throws Error if the MPD response is invalid.
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
 * Fetches the current player volume from the MPD server.
 * @param mpdClient The MPD client instance.
 * @param profile The MPD profile.
 * @returns A Promise that resolves to the player volume.
 * @throws Error if the MPD response is invalid.
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
