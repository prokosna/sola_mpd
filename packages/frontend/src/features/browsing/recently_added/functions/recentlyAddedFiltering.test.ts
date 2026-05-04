import { create } from "@bufbuild/protobuf";
import { StringValueSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	extractRecentlyAddedFastFilterValues,
	extractRecentlyAddedFilterValues,
	sortRecentlyAddedFilterValues,
} from "./recentlyAddedFiltering";

function createStringMetadataValue(str: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: str }),
		},
	});
}

function createTimestampMetadataValue(seconds: bigint) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "timestamp",
			value: create(TimestampSchema, { seconds }),
		},
	});
}

function createBrowsingSong(
	path: string,
	updatedAtSeconds: bigint,
	artist: string,
) {
	return create(SongSchema, {
		path,
		metadata: {
			[Song_MetadataTag.UPDATED_AT]:
				createTimestampMetadataValue(updatedAtSeconds),
			[Song_MetadataTag.ARTIST]: createStringMetadataValue(artist),
			[Song_MetadataTag.ALBUM]: createStringMetadataValue("Album"),
			[Song_MetadataTag.ALBUM_ARTIST]: createStringMetadataValue(artist),
			[Song_MetadataTag.COMPOSER]: createStringMetadataValue("Composer"),
			[Song_MetadataTag.GENRE]: createStringMetadataValue("Genre"),
		},
	});
}

describe("extractRecentlyAddedFilterValues", () => {
	it("should extract filter values from songs", () => {
		const songs = [
			createBrowsingSong("/a.mp3", 100n, "Artist A"),
			createBrowsingSong("/b.mp3", 200n, "Artist B"),
		];
		const result = extractRecentlyAddedFilterValues(songs);
		const artistValues = result.get(Song_MetadataTag.ARTIST);
		expect(artistValues).toBeDefined();
		expect(artistValues).toContain("Artist A");
		expect(artistValues).toContain("Artist B");
	});

	it("should order values by most recent timestamp", () => {
		const songs = [
			createBrowsingSong("/a.mp3", 100n, "Old Artist"),
			createBrowsingSong("/b.mp3", 200n, "New Artist"),
		];
		const result = extractRecentlyAddedFilterValues(songs);
		const artistValues = result.get(Song_MetadataTag.ARTIST);
		expect(artistValues?.[0]).toBe("New Artist");
		expect(artistValues?.[1]).toBe("Old Artist");
	});

	it("should return empty map for empty songs", () => {
		const result = extractRecentlyAddedFilterValues([]);
		expect(result.size).toBe(0);
	});
});

describe("extractRecentlyAddedFastFilterValues", () => {
	it("emits values in first-seen order from a recency-sorted song list", () => {
		const songs = [
			createBrowsingSong("/0.mp3", 300n, "Artist B"),
			createBrowsingSong("/1.mp3", 200n, "Artist A"),
			createBrowsingSong("/2.mp3", 100n, "Artist B"),
		];
		const result = extractRecentlyAddedFastFilterValues(songs);
		expect(result.get(Song_MetadataTag.ARTIST)).toEqual([
			"Artist B",
			"Artist A",
		]);
	});

	it("skips empty values and dedupes per tag", () => {
		const songs = [
			createBrowsingSong("/a.mp3", 100n, ""),
			createBrowsingSong("/b.mp3", 200n, "Artist A"),
			createBrowsingSong("/c.mp3", 300n, "Artist A"),
		];
		const result = extractRecentlyAddedFastFilterValues(songs);
		expect(result.get(Song_MetadataTag.ARTIST)).toEqual(["Artist A"]);
	});

	it("returns a map seeded with all browser tags even when empty", () => {
		const result = extractRecentlyAddedFastFilterValues([]);
		expect(result.get(Song_MetadataTag.ARTIST)).toEqual([]);
		expect(result.get(Song_MetadataTag.ALBUM)).toEqual([]);
	});
});

describe("sortRecentlyAddedFilterValues", () => {
	it("should sort filter values based on all sorted values order", () => {
		const filterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, ["B", "A"]],
		]);
		const allSortedFilterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, ["A", "B", "C"]],
		]);
		const result = sortRecentlyAddedFilterValues(
			filterValues,
			allSortedFilterValues,
		);
		const artistValues = result.get(Song_MetadataTag.ARTIST);
		expect(artistValues).toEqual(["A", "B"]);
	});

	it("should return empty array when filter values are empty", () => {
		const filterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, []],
		]);
		const allSortedFilterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, ["A", "B"]],
		]);
		const result = sortRecentlyAddedFilterValues(
			filterValues,
			allSortedFilterValues,
		);
		expect(result.get(Song_MetadataTag.ARTIST)).toEqual([]);
	});

	it("should return all sorted values when counts match", () => {
		const filterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, ["B", "A"]],
		]);
		const allSortedFilterValues = new Map<Song_MetadataTag, string[]>([
			[Song_MetadataTag.ARTIST, ["A", "B"]],
		]);
		const result = sortRecentlyAddedFilterValues(
			filterValues,
			allSortedFilterValues,
		);
		expect(result.get(Song_MetadataTag.ARTIST)).toEqual(["A", "B"]);
	});
});
