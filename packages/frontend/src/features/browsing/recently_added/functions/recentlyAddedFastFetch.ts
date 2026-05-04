import { create, toJsonString } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import {
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	MpdCommand_Database_SearchSortSchema,
	MpdCommand_Database_SearchWindowSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../../mpd";

/**
 * Issue a single delta fetch for the fast Recently Added path.
 *
 * The query is `(added-since 'sinceTime') sort -Added window offset:`. Because
 * widening `sinceTime` only enlarges the result universe and `sort -Added`
 * keeps the leading rows stable, advancing `offset` between calls returns the
 * songs that were not yet visible at the previous cutoff.
 */
export async function fetchRecentlyAddedFastDelta(
	mpdClient: MpdClient,
	profile: MpdProfile,
	sinceTime: Date,
	offset: number,
): Promise<Song[]> {
	const condition = create(FilterConditionSchema, {
		tag: Song_MetadataTag.ADDED_AT,
		value: create(Song_MetadataValueSchema, {
			value: {
				case: "timestamp",
				value: timestampFromDate(sinceTime),
			},
		}),
		operator: FilterCondition_Operator.ADDED_SINCE,
	});

	const sort = create(MpdCommand_Database_SearchSortSchema, {
		tag: Song_MetadataTag.ADDED_AT,
		descending: true,
	});

	// `end = 0` means unbounded; pair with `start = offset` to get the delta
	// from the last cumulative position onwards.
	const window = create(MpdCommand_Database_SearchWindowSchema, {
		start: offset,
		end: 0,
	});

	const req = create(MpdRequestSchema, {
		profile,
		command: {
			case: "search",
			value: {
				conditions: [condition],
				sort,
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

export function computeSinceTime(
	daysAgo: number,
	now: Date = new Date(),
): Date {
	const since = new Date(now);
	since.setUTCDate(since.getUTCDate() - daysAgo);
	return since;
}
