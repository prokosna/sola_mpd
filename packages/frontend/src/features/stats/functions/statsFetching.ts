import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

export async function fetchStats(mpdClient: MpdClient, mpdProfile: MpdProfile) {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile: mpdProfile,
			command: {
				case: "stats",
				value: {},
			},
		}),
	);
	if (res.command.case !== "stats") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.stats;
}
