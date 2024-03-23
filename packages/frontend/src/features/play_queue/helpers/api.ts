import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdClient } from "../../mpd";

export async function fetchPlayQueueSongs(
  mpdClient: MpdClient,
  profile: MpdProfile,
) {
  const req = new MpdRequest({
    profile,
    command: { case: "playlistinfo", value: {} },
  });
  const res = await mpdClient.command(req);
  if (res.command.case !== "playlistinfo") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.songs;
}
