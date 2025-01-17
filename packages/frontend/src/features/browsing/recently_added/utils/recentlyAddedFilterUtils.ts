import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import {
	getSongMetadataAsNumber,
	getSongMetadataAsString,
} from "@sola_mpd/domain/src/utils/songUtils.js";
import { listBrowserSongMetadataTags } from "../../common/utils/browserFilterUtils";

/**
 * Extract filter values.
 *
 * @param all_songs All songs
 * @returns Values map
 */
export function extractRecentlyAddedFilterValues(
	all_songs: Song[],
): Map<Song_MetadataTag, string[]> {
	const all_tags = listBrowserSongMetadataTags();
	const valueTimestampMap = new Map<Song_MetadataTag, Map<string, number>>();
	for (const song of all_songs) {
		const timestamp = getSongMetadataAsNumber(
			song,
			Song_MetadataTag.UPDATED_AT,
		);
		if (timestamp === undefined) {
			continue;
		}
		for (const tag of all_tags) {
			const value = getSongMetadataAsString(song, tag);
			if (value === undefined) {
				continue;
			}
			const existing = valueTimestampMap.get(tag);
			if (existing === undefined) {
				valueTimestampMap.set(tag, new Map([[value, timestamp]]));
				continue;
			}
			const existingTimestamp = existing.get(value);
			if (existingTimestamp === undefined || existingTimestamp < timestamp) {
				existing.set(value, timestamp);
			}
		}
	}

	const filterValuesMap = new Map<Song_MetadataTag, string[]>();
	for (const [tag, values] of valueTimestampMap.entries()) {
		const valuesArray = Array.from(values.keys()).sort(
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			(a, b) => values.get(b)! - values.get(a)!,
		);
		filterValuesMap.set(tag, valuesArray);
	}

	return filterValuesMap;
}

export function sortRecentlyAddedFilterValues(
	filterValues: Map<Song_MetadataTag, string[]>,
	allSortedFilterValues: Map<Song_MetadataTag, string[]>,
): Map<Song_MetadataTag, string[]> {
	const sortedFilterValues = new Map<Song_MetadataTag, string[]>();

	for (const [tag, values] of filterValues.entries()) {
		const sortedValues = allSortedFilterValues.get(tag) ?? [];
		if (values.length === 0 || sortedValues.length === 0) {
			sortedFilterValues.set(tag, []);
			continue;
		}
		if (values.length === sortedValues.length) {
			sortedFilterValues.set(tag, sortedValues);
			continue;
		}

		const valuesSet = new Set(values);
		const filteredAndSorted = sortedValues.filter((value) =>
			valuesSet.has(value),
		);

		sortedFilterValues.set(tag, filteredAndSorted);
	}

	return sortedFilterValues;
}
