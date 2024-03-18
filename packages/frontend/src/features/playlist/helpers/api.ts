import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdClient } from "../../mpd";

export async function addPlaylist(
  mpdClient: MpdClient,
  profile: MpdProfile,
  playlist: Playlist,
): Promise<void> {
  await mpdClient.commandBulk([
    new MpdRequest({
      profile,
      command: {
        case: "save",
        value: {
          name: playlist.name,
        },
      },
    }),
    new MpdRequest({
      profile,
      command: {
        case: "playlistclear",
        value: {
          name: playlist.name,
        },
      },
    }),
  ]);
  return;
}

export async function fetchPlaylists(
  mpdClient: MpdClient,
  profile: MpdProfile,
): Promise<Playlist[]> {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "listplaylists",
        value: {},
      },
    }),
  );
  if (res.command.case !== "listplaylists") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.playlists;
}

export async function fetchPlaylistSongs(
  mpdClient: MpdClient,
  profile: MpdProfile,
  playlist: Playlist,
): Promise<Song[]> {
  const res = await mpdClient.command(
    new MpdRequest({
      profile,
      command: {
        case: "listplaylistinfo",
        value: {
          name: playlist.name,
        },
      },
    }),
  );
  if (res.command.case !== "listplaylistinfo") {
    throw Error(`Invalid MPD response: ${res.toJsonString()}`);
  }
  return res.command.value.songs;
}
