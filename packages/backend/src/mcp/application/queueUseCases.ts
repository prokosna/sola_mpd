import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import {
	executeMpdCommand,
	executeMpdCommandsSequentially,
	UnexpectedMpdResponseError,
} from "./mpdCommandHelpers.js";

type QueueDeps = {
	mpdClient: MpdClient;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
};

export async function getQueueUseCase(
	input: { limit: number; profileName?: string } & QueueDeps,
): Promise<{ total: number; songs: Song[] }> {
	const { mpdClient, mpdProfileStateRepository, limit } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	const res = await executeMpdCommand(mpdClient, profile, {
		case: "playlistinfo",
		value: {},
	});
	if (res.command?.case !== "playlistinfo") {
		throw new UnexpectedMpdResponseError("playlistinfo");
	}
	const all = res.command.value.songs;
	return { total: all.length, songs: all.slice(0, limit) };
}

export async function addUriToQueueUseCase(
	input: { uri: string; profileName?: string } & QueueDeps,
): Promise<void> {
	const { mpdClient, mpdProfileStateRepository, uri } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	await executeMpdCommand(mpdClient, profile, {
		case: "add",
		value: { uri },
	});
}

export type AddUrisToQueueResult = {
	added: number;
	failure?: { uri: string; error: unknown };
};

export async function addUrisToQueueUseCase(
	input: { uris: string[]; profileName?: string } & QueueDeps,
): Promise<AddUrisToQueueResult> {
	const { mpdClient, mpdProfileStateRepository, uris } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	const result = await executeMpdCommandsSequentially(
		mpdClient,
		profile,
		uris.map((uri) => ({ case: "add", value: { uri } })),
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

export async function clearQueueUseCase(
	input: { profileName?: string } & QueueDeps,
): Promise<void> {
	const { mpdClient, mpdProfileStateRepository } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	await executeMpdCommand(mpdClient, profile, { case: "clear", value: {} });
}
