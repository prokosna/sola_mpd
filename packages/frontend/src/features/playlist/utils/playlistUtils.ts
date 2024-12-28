import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { MpdClient } from "../../mpd";

/**
 * Adds a new playlist to the MPD server.
 *
 * This function creates a new playlist with the given name and clears any existing
 * content if a playlist with the same name already exists.
 *
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param profile - The MPD profile containing connection details.
 * @param playlist - The playlist object containing the name of the playlist to be added.
 * @returns A promise that resolves when the playlist has been successfully added.
 */
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

/**
 * Fetches all playlists from the MPD server.
 *
 * This function retrieves a list of all playlists available on the MPD server
 * using the provided MPD client and profile.
 *
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param profile - The MPD profile containing connection details.
 * @returns A promise that resolves to an array of Playlist objects.
 * @throws Error if the MPD response is invalid.
 */
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

/**
 * Fetches songs from a specific playlist on the MPD server.
 *
 * This function retrieves all songs from the specified playlist using
 * the provided MPD client and profile.
 *
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param profile - The MPD profile containing connection details.
 * @param playlist - The playlist object containing the name of the playlist to fetch songs from.
 * @returns A promise that resolves to an array of Song objects.
 * @throws Error if the MPD response is invalid.
 */
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
