import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	filterSongsByGlobalFilter,
	filterStringsByGlobalFilter,
	includesToken,
} from "./globalFilterFiltering";

function createMetadataValue(str: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: str }),
		},
	});
}

function createSong(title: string, artist: string) {
	return create(SongSchema, {
		path: `/${title}.mp3`,
		metadata: {
			[Song_MetadataTag.TITLE]: createMetadataValue(title),
			[Song_MetadataTag.ARTIST]: createMetadataValue(artist),
		},
	});
}

const titleColumn = create(SongTableColumnSchema, {
	tag: Song_MetadataTag.TITLE,
});
const artistColumn = create(SongTableColumnSchema, {
	tag: Song_MetadataTag.ARTIST,
});
const targetColumns = [titleColumn, artistColumn];

describe("includesToken", () => {
	it("should return true when all tokens match", () => {
		const song = createSong("Hello World", "John");
		expect(includesToken(song, ["hello", "john"], targetColumns)).toBe(true);
	});

	it("should return false when a token does not match", () => {
		const song = createSong("Hello World", "John");
		expect(includesToken(song, ["hello", "jane"], targetColumns)).toBe(false);
	});

	it("should match accent-insensitively", () => {
		const song = createSong("Caf\u00e9", "Art\u00edst");
		expect(includesToken(song, ["cafe", "artist"], targetColumns)).toBe(true);
	});

	it("should return true for empty tokens", () => {
		const song = createSong("Hello", "World");
		expect(includesToken(song, [], targetColumns)).toBe(true);
	});
});

describe("filterSongsByGlobalFilter", () => {
	const songs = [
		createSong("Alpha", "Bob"),
		createSong("Beta", "Alice"),
		createSong("Gamma", "Bob"),
	];

	it("should return all songs when tokens are empty", () => {
		expect(filterSongsByGlobalFilter(songs, [], targetColumns)).toBe(songs);
	});

	it("should filter songs matching all tokens", () => {
		const result = filterSongsByGlobalFilter(songs, ["bob"], targetColumns);
		expect(result).toHaveLength(2);
		expect(result[0].path).toBe("/Alpha.mp3");
		expect(result[1].path).toBe("/Gamma.mp3");
	});

	it("should return empty array when no songs match", () => {
		const result = filterSongsByGlobalFilter(
			songs,
			["nonexistent"],
			targetColumns,
		);
		expect(result).toHaveLength(0);
	});
});

describe("filterStringsByGlobalFilter", () => {
	const strings = ["Apple", "Banana", "Cherry"];

	it("should return all strings when tokens are empty", () => {
		expect(filterStringsByGlobalFilter(strings, [], [])).toBe(strings);
	});

	it("should filter strings matching tokens", () => {
		const result = filterStringsByGlobalFilter(strings, [], ["app"]);
		expect(result).toEqual(["Apple"]);
	});

	it("should always include shouldInclude strings", () => {
		const result = filterStringsByGlobalFilter(strings, ["Cherry"], ["app"]);
		expect(result).toEqual(["Apple", "Cherry"]);
	});

	it("should match accent-insensitively", () => {
		const accented = ["Caf\u00e9", "T\u00e9a", "Water"];
		const result = filterStringsByGlobalFilter(accented, [], ["cafe"]);
		expect(result).toEqual(["Caf\u00e9"]);
	});
});
