import { create, toJsonString } from "@bufbuild/protobuf";
import type { MpdRequest } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

export function buildAddCommands(
	songs: Song[],
	profile: MpdProfile,
): MpdRequest[] {
	return songs.map((song) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "add",
				value: {
					uri: song.path,
				},
			},
		}),
	);
}

export function buildReplaceQueueCommands(
	songs: Song[],
	profile: MpdProfile,
): MpdRequest[] {
	return [
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "clear",
				value: {},
			},
		}),
		...buildAddCommands(songs, profile),
	];
}

export async function addSongsToQueue(
	mpdClient: MpdClient,
	songs: Song[],
	profile: MpdProfile,
): Promise<void> {
	const commands = buildAddCommands(songs, profile);
	await mpdClient.commandBulk(commands);
}

export async function replaceQueueWithSongs(
	mpdClient: MpdClient,
	songs: Song[],
	profile: MpdProfile,
): Promise<void> {
	const commands = buildReplaceQueueCommands(songs, profile);
	await mpdClient.commandBulk(commands);
}

export async function addSongAndPlay(
	song: Song,
	mpdClient: MpdClient,
	profile: MpdProfile,
): Promise<void> {
	const addCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "add",
			value: { uri: song.path },
		},
	});
	await mpdClient.command(addCommand);
	const getCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "playlistinfo",
			value: {},
		},
	});
	const res = await mpdClient.command(getCommand);
	if (res.command.case !== "playlistinfo") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	const playQueueSongs = res.command.value.songs;
	await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "play",
				value: {
					target: {
						case: "pos",
						value: String(playQueueSongs.length - 1),
					},
				},
			},
		}),
	);
}
