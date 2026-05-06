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
 * Fetch one chunk of the library via MPD `search`.
 *
 * Conditions is empty; the backend turns that into the `(base "")` tautology
 * so MPD returns every song. No `sort` is specified — we rely on MPD's
 * deterministic database-traversal order so sequential `window` calls form a
 * non-overlapping partition of the result set, matching what `listallinfo`
 * currently returns.
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
