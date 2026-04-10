import { create } from "@bufbuild/protobuf";
import { StringValueSchema, TimestampSchema } from "@bufbuild/protobuf/wkt";
import {
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { filterSongsByAndConditions } from "./songFilter";

function createStringMetadataValue(str: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: str }),
		},
	});
}

function createIntMetadataValue(n: number) {
	return create(Song_MetadataValueSchema, {
		value: { case: "intValue", value: { value: n } },
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

function createSong(
	path: string,
	metadata: Record<number, ReturnType<typeof createStringMetadataValue>>,
) {
	return create(SongSchema, { path, metadata });
}

function createCondition(
	tag: Song_MetadataTag,
	operator: FilterCondition_Operator,
	value: ReturnType<typeof createStringMetadataValue>,
) {
	return create(FilterConditionSchema, {
		uuid: "test",
		tag,
		operator,
		value,
	});
}

describe("songFilter", () => {
	describe("filterSongsByAndConditions", () => {
		it("should return all songs when no conditions are given", () => {
			const songs = [createSong("/a.mp3", {}), createSong("/b.mp3", {})];
			const result = filterSongsByAndConditions(songs, []);
			expect(result).toHaveLength(2);
		});

		it("should filter by EQUAL operator (case-insensitive)", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Hello"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("World"),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				createStringMetadataValue("hello"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/a.mp3");
		});

		it("should filter by NOT_EQUAL operator", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Hello"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("World"),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.NOT_EQUAL,
				createStringMetadataValue("hello"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/b.mp3");
		});

		it("should filter by CONTAIN operator", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Hello World"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Goodbye"),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.CONTAIN,
				createStringMetadataValue("hello"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/a.mp3");
		});

		it("should filter by NOT_CONTAIN operator", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Hello World"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Goodbye"),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.NOT_CONTAIN,
				createStringMetadataValue("hello"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/b.mp3");
		});

		it("should filter by REGEX operator", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Track 01"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Song ABC"),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.REGEX,
				createStringMetadataValue("track \\d+"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/a.mp3");
		});

		it("should filter by GREATER_THAN with int values", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TRACK]: createIntMetadataValue(5),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TRACK]: createIntMetadataValue(10),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TRACK,
				FilterCondition_Operator.GREATER_THAN,
				createIntMetadataValue(7),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/b.mp3");
		});

		it("should filter by LESS_THAN_OR_EQUAL with int values", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TRACK]: createIntMetadataValue(5),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TRACK]: createIntMetadataValue(10),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.TRACK,
				FilterCondition_Operator.LESS_THAN_OR_EQUAL,
				createIntMetadataValue(5),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/a.mp3");
		});

		it("should apply multiple AND conditions", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Rock Song"),
					[Song_MetadataTag.ARTIST]: createStringMetadataValue("Band A"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Rock Ballad"),
					[Song_MetadataTag.ARTIST]: createStringMetadataValue("Band B"),
				}),
				createSong("/c.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Pop Song"),
					[Song_MetadataTag.ARTIST]: createStringMetadataValue("Band A"),
				}),
			];
			const cond1 = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.CONTAIN,
				createStringMetadataValue("rock"),
			);
			const cond2 = createCondition(
				Song_MetadataTag.ARTIST,
				FilterCondition_Operator.EQUAL,
				createStringMetadataValue("band a"),
			);
			const result = filterSongsByAndConditions(songs, [cond1, cond2]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/a.mp3");
		});

		it("should pass through songs when metadata is missing for the tag", () => {
			const songs = [createSong("/a.mp3", {})];
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				createStringMetadataValue("test"),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
		});

		it("should not mutate the input songs array", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("Hello"),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.TITLE]: createStringMetadataValue("World"),
				}),
			];
			const originalLength = songs.length;
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				createStringMetadataValue("hello"),
			);
			filterSongsByAndConditions(songs, [cond]);
			expect(songs).toHaveLength(originalLength);
		});

		it("should filter by GREATER_THAN_OR_EQUAL with timestamp values", () => {
			const songs = [
				createSong("/a.mp3", {
					[Song_MetadataTag.UPDATED_AT]: createTimestampMetadataValue(
						BigInt(1000),
					),
				}),
				createSong("/b.mp3", {
					[Song_MetadataTag.UPDATED_AT]: createTimestampMetadataValue(
						BigInt(2000),
					),
				}),
			];
			const cond = createCondition(
				Song_MetadataTag.UPDATED_AT,
				FilterCondition_Operator.GREATER_THAN_OR_EQUAL,
				createTimestampMetadataValue(BigInt(2000)),
			);
			const result = filterSongsByAndConditions(songs, [cond]);
			expect(result).toHaveLength(1);
			expect(result[0].path).toBe("/b.mp3");
		});
	});
});
