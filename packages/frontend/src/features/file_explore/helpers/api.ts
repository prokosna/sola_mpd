import { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdClient } from "../../mpd";

export async function fetchFileExploreFolders(
  mpdClient: MpdClient,
  profile: MpdProfile,
): Promise<Folder[]> {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "listAllFolders",
        value: {},
      },
    }),
  );
  if (res.command.case !== "listAllFolders") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.folders;
}

export async function fetchFileExploreSongs(
  mpdClient: MpdClient,
  profile: MpdProfile,
  folder: Folder,
): Promise<Song[]> {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "listSongsInFolder",
        value: {
          folder,
        },
      },
    }),
  );
  if (res.command.case !== "listSongsInFolder") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.songs;
}
