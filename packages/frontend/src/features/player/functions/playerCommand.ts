import { create } from "@bufbuild/protobuf";
import type { MpdRequest } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
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
