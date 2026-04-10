import { create, toJsonString } from "@bufbuild/protobuf";
import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { MpdRequest } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";
import type { SongTableKeyType } from "../types/songTableTypes";
import { convertOrderingToOperations } from "./songTableOrdering";

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

export function buildClearQueueCommands(profile: MpdProfile): MpdRequest[] {
	return [
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "clear",
				value: {},
			},
		}),
	];
}

export function buildReplaceQueueCommands(
	songs: Song[],
	profile: MpdProfile,
): MpdRequest[] {
	return [
		...buildClearQueueCommands(profile),
		...buildAddCommands(songs, profile),
	];
}

export function buildRemoveQueueSongsCommands(
	targetSongs: Song[],
	profile: MpdProfile,
): MpdRequest[] {
	return targetSongs.map((song) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "delete",
				value: {
					target: {
						case: "id",
						value: getSongMetadataAsString(song, Song_MetadataTag.ID),
					},
				},
			},
		}),
	);
}

export function buildReorderQueueCommands(
	currentSongs: Song[],
	orderedSongs: Song[],
	songTableKeyType: SongTableKeyType,
	profile: MpdProfile,
): MpdRequest[] {
	const ops = convertOrderingToOperations(
		currentSongs,
		orderedSongs,
		songTableKeyType,
	);
	return ops.map((op) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "move",
				value: {
					from: { case: "fromId", value: op.id },
					to: String(op.to),
				},
			},
		}),
	);
}

export function buildPlaySongByIdCommand(
	song: Song,
	profile: MpdProfile,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "play",
			value: {
				target: {
					case: "id",
					value: getSongMetadataAsString(song, Song_MetadataTag.ID),
				},
			},
		},
	});
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
