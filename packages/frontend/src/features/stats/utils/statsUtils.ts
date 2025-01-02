import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type {
	Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";

import type { MpdClient } from "../../mpd";

/**
 * Fetches statistics from the MPD server.
 *
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param mpdProfile - The MPD profile containing connection details.
 * @returns A promise that resolves to the fetched statistics.
 * @throws Error if the MPD response is invalid.
 */
export async function fetchStats(mpdClient: MpdClient, mpdProfile: MpdProfile) {
	const res = await mpdClient.command(
		new MpdRequest({
			profile: mpdProfile,
			command: {
				case: "stats",
				value: {},
			},
		}),
	);
	if (res.command.case !== "stats") {
		throw Error(`Invalid MPD response: ${res.toJsonString()}`);
	}
	return res.command.value.stats;
}

/**
 * Calculates the count of distinct metadata values for a given tag across an array of songs.
 *
 * @param songs - An array of Song objects to analyze
 * @param tag - The metadata tag to count distinct values for
 * @returns The number of distinct values for the specified metadata tag
 */
export function getMetadataValueCountDistinct(
	songs: Song[],
	tag: Song_MetadataTag,
): number {
	return [...new Set(songs.map((song) => getSongMetadataAsString(song, tag)))]
		.length;
}
