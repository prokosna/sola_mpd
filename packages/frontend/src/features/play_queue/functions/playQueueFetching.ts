import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

export async function fetchPlayQueueSongs(
	mpdClient: MpdClient,
	mpdProfile: MpdProfile,
) {
	const req = create(MpdRequestSchema, {
		profile: mpdProfile,
		command: { case: "playlistinfo", value: {} },
	});
	const res = await mpdClient.command(req);
	if (res.command.case !== "playlistinfo") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.songs;
}
