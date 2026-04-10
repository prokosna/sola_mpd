import { create } from "@bufbuild/protobuf";
import { FloatValueSchema, StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import { sortSongsByColumns } from "./songTableSorting";

function createSongWithTitle(title: string) {
	return create(SongSchema, {
		path: `/${title}.mp3`,
		metadata: {
			[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: title }),
				},
			}),
		},
	});
}

function createSongWithDuration(title: string, duration: number) {
	return create(SongSchema, {
		path: `/${title}.mp3`,
		metadata: {
			[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: title }),
				},
			}),
			[Song_MetadataTag.DURATION]: create(Song_MetadataValueSchema, {
				value: {
					case: "floatValue",
					value: create(FloatValueSchema, { value: duration }),
				},
			}),
		},
	});
}

describe("songTableSorting", () => {
	const collator = new Intl.Collator("en");

	describe("sortSongsByColumns", () => {
		it("should sort songs by title ascending", () => {
			const songs = [
				createSongWithTitle("Charlie"),
				createSongWithTitle("Alice"),
				createSongWithTitle("Bob"),
			];
			const columns = [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					sortOrder: 0,
					isSortDesc: false,
					widthFlex: 100,
				}),
			];
			const result = sortSongsByColumns([...songs], columns, collator);
			expect(result.map((s) => s.path)).toEqual([
				"/Alice.mp3",
				"/Bob.mp3",
				"/Charlie.mp3",
			]);
		});

		it("should sort songs by title descending", () => {
			const songs = [
				createSongWithTitle("Alice"),
				createSongWithTitle("Charlie"),
				createSongWithTitle("Bob"),
			];
			const columns = [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					sortOrder: 0,
					isSortDesc: true,
					widthFlex: 100,
				}),
			];
			const result = sortSongsByColumns([...songs], columns, collator);
			expect(result.map((s) => s.path)).toEqual([
				"/Charlie.mp3",
				"/Bob.mp3",
				"/Alice.mp3",
			]);
		});

		it("should skip columns without valid sort order", () => {
			const songs = [createSongWithTitle("B"), createSongWithTitle("A")];
			const columns = [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					widthFlex: 100,
				}),
			];
			const result = sortSongsByColumns([...songs], columns, collator);
			expect(result.map((s) => s.path)).toEqual(["/B.mp3", "/A.mp3"]);
		});

		it("should not mutate the input array", () => {
			const songs = [
				createSongWithTitle("Charlie"),
				createSongWithTitle("Alice"),
			];
			const original = [...songs];
			const columns = [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					sortOrder: 0,
					isSortDesc: false,
					widthFlex: 100,
				}),
			];
			sortSongsByColumns(songs, columns, collator);
			expect(songs).toEqual(original);
		});

		it("should sort by secondary column when primary values are equal", () => {
			const s1 = createSongWithDuration("Same", 300);
			const s2 = createSongWithDuration("Same", 100);
			const s3 = createSongWithDuration("Same", 200);
			const columns = [
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.TITLE,
					sortOrder: 0,
					isSortDesc: false,
					widthFlex: 100,
				}),
				create(SongTableColumnSchema, {
					tag: Song_MetadataTag.DURATION,
					sortOrder: 1,
					isSortDesc: false,
					widthFlex: 100,
				}),
			];
			const result = sortSongsByColumns([s1, s2, s3], columns, collator);
			expect(result).toEqual([s2, s3, s1]);
		});
	});
});
