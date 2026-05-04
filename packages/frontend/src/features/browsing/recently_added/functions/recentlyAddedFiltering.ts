import {
	getSongMetadataAsNumber,
	getSongMetadataAsString,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { listBrowserSongMetadataTags } from "../../common/functions/browserFilter";

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
			// biome-ignore lint/style/noNonNullAssertion: Must not be null.
			(a, b) => values.get(b)! - values.get(a)!,
		);
		filterValuesMap.set(tag, valuesArray);
	}

	return filterValuesMap;
}

/**
 * Fast-path counterpart to extractRecentlyAddedFilterValues. Expects a song
 * list that is already sorted by recency (ADDED_AT descending) and emits
 * per-tag values in first-seen order, which preserves the recency order
 * without an additional sort step.
 */
export function extractRecentlyAddedFastFilterValues(
	sortedSongs: Song[],
): Map<Song_MetadataTag, string[]> {
	const tags = listBrowserSongMetadataTags();
	const seen = new Map<Song_MetadataTag, Set<string>>();
	const result = new Map<Song_MetadataTag, string[]>();
	for (const tag of tags) {
		seen.set(tag, new Set());
		result.set(tag, []);
	}
	for (const song of sortedSongs) {
		for (const tag of tags) {
			const value = getSongMetadataAsString(song, tag);
			if (value === undefined || value === "") {
				continue;
			}
			const seenSet = seen.get(tag);
			const values = result.get(tag);
			if (seenSet === undefined || values === undefined || seenSet.has(value)) {
				continue;
			}
			seenSet.add(value);
			values.push(value);
		}
	}
	return result;
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
