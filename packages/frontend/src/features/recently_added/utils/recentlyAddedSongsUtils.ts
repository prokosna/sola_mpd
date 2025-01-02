import type { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import type {
	Song,
	Song_MetadataTag,
	Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

import { convertRecentlyAddedFilterToCondition } from "./recentlyAddedFilterUtils";

/**
 * Fetch songs based on filters.
 *
 * @param mpdClient MPD client
 * @param profile MPD profile
 * @param recentlyAddedFilters Filters
 * @param selectedValuesMap Values map
 * @returns Songs
 */
export async function fetchRecentlyAddedSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	recentlyAddedFilters: RecentlyAddedFilter[],
	selectedValuesMap: Map<Song_MetadataTag, Song_MetadataValue[]>,
): Promise<Song[]> {
	const conditions = recentlyAddedFilters
		.map((filter) =>
			convertRecentlyAddedFilterToCondition(filter, selectedValuesMap),
		)
		.filter((condition) => condition !== undefined) as FilterCondition[];
	if (conditions.length === 0) {
		return [];
	}

	const req = new MpdRequest({
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
		throw Error(`Invalid MPD response: ${res.toJsonString()}`);
	}
	return res.command.value.songs;
}
