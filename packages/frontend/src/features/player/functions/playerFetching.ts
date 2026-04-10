import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

export async function fetchCurrentSong(
	mpdClient: MpdClient,
	profile: MpdProfile,
) {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "currentsong",
				value: {},
			},
		}),
	);
	if (res.command.case !== "currentsong") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.song;
}

export async function fetchPlayerStatus(
	mpdClient: MpdClient,
	profile: MpdProfile,
) {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "status",
				value: {},
			},
		}),
	);
	if (res.command.case !== "status") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.status;
}

export async function fetchPlayerVolume(
	mpdClient: MpdClient,
	profile: MpdProfile,
) {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "getvol",
				value: {},
			},
		}),
	);
	if (res.command.case !== "getvol") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.vol;
}
