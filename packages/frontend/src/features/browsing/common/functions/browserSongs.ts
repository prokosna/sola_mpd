import { create, toJsonString } from "@bufbuild/protobuf";
import type { FilterCondition } from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../../mpd";
import type { BrowserFilterView } from "../types/browserFilterView";

import { convertBrowserFilterToCondition } from "./browserFilter";

export async function fetchBrowserSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	browserFilters: BrowserFilterView[],
): Promise<Song[]> {
	const conditions = browserFilters
		.map((filter) =>
			convertBrowserFilterToCondition(filter.tag, filter.selectedValues),
		)
		.filter((condition) => condition !== undefined) as FilterCondition[];
	if (conditions.length === 0) {
		return [];
	}

	const req = create(MpdRequestSchema, {
		profile,
		command: {
			case: "search",
			value: {
				conditions,
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
