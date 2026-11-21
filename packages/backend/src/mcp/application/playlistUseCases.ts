import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { findSkippedPlaylistUris } from "../functions/findSkippedPlaylistUris.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import {
	executeMpdCommand,
	executeMpdCommandsSequentially,
	UnexpectedMpdResponseError,
} from "./mpdCommandHelpers.js";

type PlaylistDeps = {
	mpdClient: MpdClient;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
	profileName?: string;
};

export class PlaylistQueueReadbackError extends Error {
	constructor(playlistName: string, cause: unknown) {
		super(
			`Loaded playlist "${playlistName}" into the queue, but could not read the queue back to find skipped songs: ${cause instanceof Error ? cause.message : String(cause)}`,
			{ cause },
		);
		this.name = "PlaylistQueueReadbackError";
	}
}

export async function listPlaylistsUseCase(
	input: PlaylistDeps,
): Promise<Playlist[]> {
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const res = await executeMpdCommand(input.mpdClient, profile, {
		case: "listplaylists",
		value: {},
	});
	if (res.command?.case !== "listplaylists") {
		throw new UnexpectedMpdResponseError("listplaylists");
	}
	return res.command.value.playlists;
}

export async function getPlaylistSongsUseCase(
	input: { name: string } & PlaylistDeps,
): Promise<Song[]> {
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const res = await executeMpdCommand(input.mpdClient, profile, {
		case: "listplaylistinfo",
		value: { name: input.name },
	});
	if (res.command?.case !== "listplaylistinfo") {
		throw new UnexpectedMpdResponseError("listplaylistinfo");
	}
	return res.command.value.songs;
}

export type AddUrisToPlaylistResult = {
	added: number;
	failure?: { uri: string; error: unknown };
};

export async function addUrisToPlaylistUseCase(
	input: { name: string; uris: string[] } & PlaylistDeps,
): Promise<AddUrisToPlaylistResult> {
	const { name, uris } = input;
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const result = await executeMpdCommandsSequentially(
		input.mpdClient,
		profile,
		uris.map((uri) => ({ case: "playlistadd", value: { name, uri } })),
	);
	if (result.failure === undefined) {
		return { added: result.completed };
	}
	return {
		added: result.completed,
		failure: {
			uri: uris[result.failure.index] as string,
			error: result.failure.error,
		},
	};
}

export async function savePlaylistFromQueueUseCase(
	input: { name: string } & PlaylistDeps,
): Promise<void> {
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	await executeMpdCommand(input.mpdClient, profile, {
		case: "save",
		value: { name: input.name },
	});
}

export type LoadPlaylistResult = {
	requested: number;
	skippedUris: string[];
};

export async function loadPlaylistIntoQueueUseCase(
	input: { name: string } & PlaylistDeps,
): Promise<LoadPlaylistResult> {
	const { mpdClient, name } = input;
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const playlistRes = await executeMpdCommand(mpdClient, profile, {
		case: "listplaylistinfo",
		value: { name },
	});
	if (playlistRes.command?.case !== "listplaylistinfo") {
		throw new UnexpectedMpdResponseError("listplaylistinfo");
	}
	const uris = playlistRes.command.value.songs.map((song) => song.path);
	const statusRes = await executeMpdCommand(mpdClient, profile, {
		case: "status",
		value: {},
	});
	if (
		statusRes.command?.case !== "status" ||
		statusRes.command.value.status === undefined
	) {
		throw new UnexpectedMpdResponseError("status");
	}
	const queueLengthBefore = statusRes.command.value.status.playQueueLength;
	await executeMpdCommand(mpdClient, profile, {
		case: "load",
		value: { name },
	});
	let appendedUris: string[];
	try {
		const queueRes = await executeMpdCommand(mpdClient, profile, {
			case: "playlistinfo",
			value: {},
		});
		if (queueRes.command?.case !== "playlistinfo") {
			throw new UnexpectedMpdResponseError("playlistinfo");
		}
		appendedUris = queueRes.command.value.songs
			.slice(queueLengthBefore)
			.map((song) => song.path);
	} catch (err) {
		throw new PlaylistQueueReadbackError(name, err);
	}
	return {
		requested: uris.length,
		skippedUris: findSkippedPlaylistUris(uris, appendedUris),
	};
}
