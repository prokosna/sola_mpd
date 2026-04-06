import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

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
