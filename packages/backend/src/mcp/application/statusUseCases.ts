import type { MpdPlayerStatus } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { MpdStats } from "@sola_mpd/shared/src/models/mpd/mpd_stats_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import {
	executeMpdCommand,
	UnexpectedMpdResponseError,
} from "./mpdCommandHelpers.js";

type StatusDeps = {
	mpdClient: MpdClient;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
};

export async function getMpdStatusUseCase(
	input: { profileName?: string } & StatusDeps,
): Promise<{
	status: MpdPlayerStatus | undefined;
	currentSong: Song | undefined;
}> {
	const { mpdClient, mpdProfileStateRepository, profileName } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		profileName,
	);
	const [statusRes, currentRes] = await Promise.all([
		executeMpdCommand(mpdClient, profile, { case: "status", value: {} }),
		executeMpdCommand(mpdClient, profile, { case: "currentsong", value: {} }),
	]);
	const status =
		statusRes.command?.case === "status"
			? statusRes.command.value.status
			: undefined;
	const currentSong =
		currentRes.command?.case === "currentsong"
			? currentRes.command.value.song
			: undefined;
	return { status, currentSong };
}

export async function getMpdStatsUseCase(
	input: { profileName?: string } & StatusDeps,
): Promise<MpdStats | undefined> {
	const { mpdClient, mpdProfileStateRepository, profileName } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		profileName,
	);
	const res = await executeMpdCommand(mpdClient, profile, {
		case: "stats",
		value: {},
	});
	if (res.command?.case !== "stats") {
		throw new UnexpectedMpdResponseError("stats");
	}
	return res.command.value.stats;
}
