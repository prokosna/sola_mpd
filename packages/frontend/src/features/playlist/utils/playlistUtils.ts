import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * Add new playlist to MPD server.
 *
 * Creates or updates playlist with given name and
 * clears any existing content.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @param playlist Playlist to create
 */
export async function addPlaylist(
	mpdClient: MpdClient,
	profile: MpdProfile,
	playlist: Playlist,
): Promise<void> {
	await mpdClient.commandBulk([
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "save",
				value: {
					name: playlist.name,
				},
			},
		}),
		create(MpdRequestSchema, {
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
 * Fetch all playlists from MPD server.
 *
 * Gets list of playlists with names and timestamps
 * via listplaylists command.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @returns List of playlists
 */
export async function fetchPlaylists(
	mpdClient: MpdClient,
	profile: MpdProfile,
): Promise<Playlist[]> {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "listplaylists",
				value: {},
			},
		}),
	);
	if (res.command.case !== "listplaylists") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.playlists;
}

/**
 * Fetch songs from specific playlist.
 *
 * Gets list of songs with metadata and positions
 * via listplaylist command.
 *
 * @param mpdClient Client for sending commands
 * @param profile Server connection details
 * @param playlist Target playlist
 * @returns List of songs
 */
export async function fetchPlaylistSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	playlist: Playlist,
): Promise<Song[]> {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
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
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.songs;
}
