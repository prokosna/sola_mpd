import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	StringValueSchema,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { SongTableColumnView } from "../types/songTableTypes";
import { convertSongsToTsv } from "./songTableClipboard";

function createStringValue(value: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value }),
		},
	});
}

function createColumns(tags: Song_MetadataTag[]): SongTableColumnView[] {
	return tags.map((tag) => ({ tag, widthFlex: 100, isSortDesc: false }));
}

describe("convertSongsToTsv", () => {
	it("should join columns with tabs and songs with newlines in order", () => {
		const songs = [
			create(SongSchema, {
				metadata: {
					[Song_MetadataTag.TITLE]: createStringValue("Song A"),
					[Song_MetadataTag.ARTIST]: createStringValue("Artist A"),
				},
			}),
			create(SongSchema, {
				metadata: {
					[Song_MetadataTag.TITLE]: createStringValue("Song B"),
					[Song_MetadataTag.ARTIST]: createStringValue("Artist B"),
				},
			}),
		];
		const columns = createColumns([
			Song_MetadataTag.ARTIST,
			Song_MetadataTag.TITLE,
		]);

		expect(convertSongsToTsv(songs, columns)).toBe(
			"Artist A\tSong A\nArtist B\tSong B",
		);
	});

	it("should format values the same way the table displays them", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.TIME]: create(Song_MetadataValueSchema, {
					value: {
						case: "floatValue",
						value: create(FloatValueSchema, { value: 245 }),
					},
				}),
				[Song_MetadataTag.UPDATED_AT]: create(Song_MetadataValueSchema, {
					value: {
						case: "timestamp",
						value: timestampFromDate(new Date(2024, 0, 15)),
					},
				}),
			},
		});
		const columns = createColumns([
			Song_MetadataTag.TIME,
			Song_MetadataTag.UPDATED_AT,
		]);

		expect(convertSongsToTsv([song], columns)).toBe("4:05\t2024-01-15");
	});

	it("should leave a missing tag as an empty cell", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.TITLE]: createStringValue("Song A"),
			},
		});
		const columns = createColumns([
			Song_MetadataTag.ALBUM,
			Song_MetadataTag.TITLE,
		]);

		expect(convertSongsToTsv([song], columns)).toBe("\tSong A");
	});

	it("should replace tabs and newlines inside a value with a space", () => {
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.COMMENT]: createStringValue("line1\r\nline2\tend"),
			},
		});
		const columns = createColumns([Song_MetadataTag.COMMENT]);

		expect(convertSongsToTsv([song], columns)).toBe("line1 line2 end");
	});

	it("should return an empty string for no songs", () => {
		expect(convertSongsToTsv([], createColumns([Song_MetadataTag.TITLE]))).toBe(
			"",
		);
	});
});
