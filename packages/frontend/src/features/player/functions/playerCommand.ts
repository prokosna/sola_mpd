import { create } from "@bufbuild/protobuf";
import type { MpdRequest } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

export function buildPauseCommand(
	profile: MpdProfile,
	pause: boolean,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "pause",
			value: { pause },
		},
	});
}

// Starts the current song from the beginning, or the first song in the queue
// when there is none.
export function buildPlayCommand(profile: MpdProfile): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "play",
			value: {},
		},
	});
}

export function buildTogglePlaybackCommand(
	profile: MpdProfile,
	playbackState: MpdPlayerStatus_PlaybackState | undefined,
): MpdRequest {
	switch (playbackState) {
		case MpdPlayerStatus_PlaybackState.PLAY:
			return buildPauseCommand(profile, true);
		// MPD ignores pause while stopped.
		case MpdPlayerStatus_PlaybackState.STOP:
			return buildPlayCommand(profile);
		default:
			return buildPauseCommand(profile, false);
	}
}

export function buildStopCommand(profile: MpdProfile): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "stop",
			value: {},
		},
	});
}

export function buildNextCommand(profile: MpdProfile): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "next",
			value: {},
		},
	});
}

export function buildPreviousCommand(profile: MpdProfile): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "previous",
			value: {},
		},
	});
}

export function buildRandomCommand(
	profile: MpdProfile,
	enable: boolean,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "random",
			value: { enable },
		},
	});
}

export function buildRepeatCommand(
	profile: MpdProfile,
	enable: boolean,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "repeat",
			value: { enable },
		},
	});
}

export function buildConsumeCommand(
	profile: MpdProfile,
	enable: boolean,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "consume",
			value: { enable },
		},
	});
}

export function buildSetVolumeCommand(
	profile: MpdProfile,
	volume: number,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "setvol",
			value: { vol: volume },
		},
	});
}

export function buildSeekCommand(
	profile: MpdProfile,
	time: number,
): MpdRequest {
	return create(MpdRequestSchema, {
		profile,
		command: {
			case: "seek",
			value: {
				target: {
					case: "current",
					value: true,
				},
				time,
			},
		},
	});
}
