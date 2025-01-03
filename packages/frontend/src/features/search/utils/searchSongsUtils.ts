import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";
import { filterSongsByAndConditions } from "../../song_filter";

import { convertSearchToConditions, mergeSongsList } from "./searchUtils";

/**
 * Fetch songs matching search criteria.
 *
 * Handles both MPD and non-MPD conditions.
 *
 * @param mpdClient MPD client instance
 * @param profile Current MPD profile
 * @param search Search configuration
 * @returns Matching songs
 */
export async function fetchSearchSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	search: Search,
): Promise<Song[]> {
	// Conditions OR[] -> AND[]
	const searchConditions = convertSearchToConditions(search);

	if (searchConditions.length === 0) {
		return [];
	}

	const songsList = await Promise.all(
		// OR conditions
		searchConditions.map(async (searchCondition) => {
			// AND conditions
			let songs = undefined;

			// Search conditions supported by MPD natively
			const mpdConditions = searchCondition.mpdConditions;
			if (mpdConditions.length > 0) {
				const res = await mpdClient.command(
					new MpdRequest({
						profile,
						command: {
							case: "search",
							value: {
								conditions: mpdConditions,
							},
						},
					}),
				);
				if (res.command.case !== "search") {
					throw Error(`Invalid MPD response: ${res.toJsonString()}`);
				}
				songs = res.command.value.songs;
			} else {
				// No choice not to fetch all of songs...
				const res = await mpdClient.command(
					new MpdRequest({
						profile,
						command: {
							case: "listAllSongs",
							value: {},
						},
					}),
				);
				if (res.command.case !== "listAllSongs") {
					throw Error(`Invalid MPD response: ${res.toJsonString()}`);
				}
				songs = res.command.value.songs;
			}

			// Search conditions NOT supported by MPD natively
			// These conditions need to be evaluated locally based on the MPD filtering result.
			const nonMpdConditions = searchCondition.nonMpdConditions;
			return filterSongsByAndConditions(songs, nonMpdConditions);
		}),
	);

	// OR conditions - merge all results of AND conditions
	return mergeSongsList(songsList);
}
