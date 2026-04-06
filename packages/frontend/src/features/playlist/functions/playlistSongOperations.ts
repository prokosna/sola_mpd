import { create } from "@bufbuild/protobuf";
import type { MpdRequest } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import { getSongTableKey } from "../../song_table/functions/songTableKey";
import type { SongTableKeyType } from "../../song_table/types/songTableTypes";

function buildPlaylistClearCommand(
	playlistName: string,
	profile: MpdProfile,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "playlistclear",
			value: { name: playlistName },
		},
	});
}

function buildPlaylistAddCommands(
	songs: Song[],
	playlistName: string,
	profile: MpdProfile,
): MpdRequest[] {
	return songs.map((song) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "playlistadd",
				value: {
					name: playlistName,
					uri: song.path,
				},
			},
		}),
	);
}

export function buildRemovePlaylistSongsCommands(
	targetSongs: Song[],
	allSongs: Song[],
	playlistName: string,
	profile: MpdProfile,
	songTableKeyType: SongTableKeyType,
): MpdRequest[] {
	const targetKeys = targetSongs.map((song) =>
		getSongTableKey(song, songTableKeyType),
	);
	const remainingSongs = allSongs.filter(
		(song) => !targetKeys.includes(getSongTableKey(song, songTableKeyType)),
	);

	return [
		buildPlaylistClearCommand(playlistName, profile),
		...buildPlaylistAddCommands(remainingSongs, playlistName, profile),
	];
}

export function buildClearPlaylistCommands(
	playlistName: string,
	profile: MpdProfile,
): MpdRequest[] {
	return [buildPlaylistClearCommand(playlistName, profile)];
}

export function buildDropDuplicatePlaylistSongsCommands(
	songs: Song[],
	playlistName: string,
	profile: MpdProfile,
): { commands: MpdRequest[]; duplicateCount: number } {
	const uniqueSongs = songs.reduce(
		(uniqueList: Song[], song) =>
			uniqueList.some((v) => v.path === song.path)
				? uniqueList
				: uniqueList.concat([song]),
		[],
	);

	const duplicateCount = songs.length - uniqueSongs.length;

	if (duplicateCount === 0) {
		return { commands: [], duplicateCount: 0 };
	}

	return {
		commands: [
			buildPlaylistClearCommand(playlistName, profile),
			...buildPlaylistAddCommands(uniqueSongs, playlistName, profile),
		],
		duplicateCount,
	};
}

export function buildReorderPlaylistCommands(
	orderedSongs: Song[],
	playlistName: string,
	profile: MpdProfile,
): MpdRequest[] {
	return [
		buildPlaylistClearCommand(playlistName, profile),
		...buildPlaylistAddCommands(orderedSongs, playlistName, profile),
	];
}

export function buildDeletePlaylistCommand(
	playlistName: string,
	profile: MpdProfile,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "rm",
			value: { name: playlistName },
		},
	});
}

export function buildAddSongsToPlaylistCommands(
	songs: Song[],
	playlistName: string,
	profile: MpdProfile,
): MpdRequest[] {
	return buildPlaylistAddCommands(songs, playlistName, profile);
}
