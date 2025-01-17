import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import type { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import type { MpdClient } from "../../../mpd";

import { convertBrowserFilterToCondition } from "./browserFilterUtils";

/**
 * Fetches songs from MPD that match the current browser filter conditions.
 *
 * Converts browser filters to MPD filter conditions and executes a search.
 * If no filters are selected, returns an empty array to avoid fetching all songs.
 *
 * @param mpdClient Client for MPD communication
 * @param profile Current MPD profile
 * @param browserFilters Active browser filters
 * @returns Promise resolving to matching songs, or empty array if no filters active
 * @throws Error if MPD response is invalid
 */
export async function fetchBrowserSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	browserFilters: BrowserFilter[],
): Promise<Song[]> {
	const conditions = browserFilters
		.map((filter) => convertBrowserFilterToCondition(filter))
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
