import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

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
