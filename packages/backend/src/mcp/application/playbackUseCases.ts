import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import { executeMpdCommand } from "./mpdCommandHelpers.js";

type PlaybackDeps = {
	mpdClient: MpdClient;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
};

export type PlaybackAction =
	| "play"
	| "pause"
	| "resume"
	| "stop"
	| "next"
	| "previous"
	| "seek";

export class SeekPositionRequiredError extends Error {
	constructor() {
		super("action=seek requires seek_seconds.");
		this.name = "SeekPositionRequiredError";
	}
}

export async function controlPlaybackUseCase(
	input: {
		action: PlaybackAction;
		queuePosition?: number;
		seekSeconds?: number;
		profileName?: string;
	} & PlaybackDeps,
): Promise<void> {
	const { mpdClient, mpdProfileStateRepository, action } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	switch (action) {
		case "play":
			await executeMpdCommand(mpdClient, profile, {
				case: "play",
				value:
					input.queuePosition !== undefined
						? { target: { case: "pos", value: String(input.queuePosition) } }
						: {},
			});
			break;
		case "pause":
			await executeMpdCommand(mpdClient, profile, {
				case: "pause",
				value: { pause: true },
			});
			break;
		// MPD ignores pause while stopped; a bare play also unpauses.
		case "resume":
			await executeMpdCommand(mpdClient, profile, {
				case: "play",
				value: {},
			});
			break;
		case "stop":
			await executeMpdCommand(mpdClient, profile, { case: "stop", value: {} });
			break;
		case "next":
			await executeMpdCommand(mpdClient, profile, { case: "next", value: {} });
			break;
		case "previous":
			await executeMpdCommand(mpdClient, profile, {
				case: "previous",
				value: {},
			});
			break;
		case "seek":
			if (input.seekSeconds === undefined) {
				throw new SeekPositionRequiredError();
			}
			await executeMpdCommand(mpdClient, profile, {
				case: "seek",
				value: {
					time: input.seekSeconds,
					target: { case: "current", value: true },
				},
			});
			break;
	}
}

export async function setVolumeUseCase(
	input: { volume: number; profileName?: string } & PlaybackDeps,
): Promise<void> {
	const { mpdClient, mpdProfileStateRepository, volume } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	await executeMpdCommand(mpdClient, profile, {
		case: "setvol",
		value: { vol: volume },
	});
}

export type PlaybackModeName = "repeat" | "random" | "single" | "consume";

export type PlaybackModeChange = { mode: PlaybackModeName; enabled: boolean };

const PLAYBACK_MODE_ORDER: PlaybackModeName[] = [
	"repeat",
	"random",
	"single",
	"consume",
];

export async function setPlaybackModesUseCase(
	input: {
		modes: Partial<Record<PlaybackModeName, boolean>>;
		profileName?: string;
	} & PlaybackDeps,
): Promise<PlaybackModeChange[]> {
	const { mpdClient, mpdProfileStateRepository, modes } = input;
	const profile = resolveCurrentMpdProfile(
		mpdProfileStateRepository,
		input.profileName,
	);
	const changed: PlaybackModeChange[] = [];
	for (const mode of PLAYBACK_MODE_ORDER) {
		const enabled = modes[mode];
		if (enabled === undefined) continue;
		await executeMpdCommand(mpdClient, profile, {
			case: mode,
			value: { enable: enabled },
		});
		changed.push({ mode, enabled });
	}
	return changed;
}
