import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdCommand_Database_SearchWindowSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * No `sort` is specified: sequential `window` calls form a non-overlapping
 * partition only because MPD's database-traversal order is deterministic.
 * Empty conditions become the `(base "")` tautology on the backend.
 */
export async function fetchAllSongsFastChunk(
	mpdClient: MpdClient,
	profile: MpdProfile,
	offset: number,
	limit: number,
): Promise<Song[]> {
	const window = create(MpdCommand_Database_SearchWindowSchema, {
		start: offset,
		end: offset + limit,
	});

	const req = create(MpdRequestSchema, {
		profile,
		command: {
			case: "search",
			value: {
				conditions: [],
				window,
			},
		},
	});

	const res = await mpdClient.command(req);
	if (res.command.case !== "search") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.songs;
}
