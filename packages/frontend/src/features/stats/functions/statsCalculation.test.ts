import { create } from "@bufbuild/protobuf";
import { FloatValueSchema, StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	getMetadataValueCountDistinct,
	getSongsTotalDuration,
} from "./statsCalculation";

function createSongWithArtist(artist: string) {
	return create(SongSchema, {
		metadata: {
			[Song_MetadataTag.ARTIST]: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: artist }),
				},
			}),
		},
	});
}

function createSongWithDuration(
	duration: { seconds: number } | { text: string },
) {
	return create(SongSchema, {
		metadata: {
			[Song_MetadataTag.DURATION]: create(Song_MetadataValueSchema, {
				value:
					"seconds" in duration
						? {
								case: "floatValue",
								value: create(FloatValueSchema, { value: duration.seconds }),
							}
						: {
								case: "stringValue",
								value: create(StringValueSchema, { value: duration.text }),
							},
			}),
		},
	});
}

describe("getMetadataValueCountDistinct", () => {
	it("should count distinct metadata values", () => {
		const songs = [
			createSongWithArtist("Artist A"),
			createSongWithArtist("Artist B"),
			createSongWithArtist("Artist A"),
		];

		const result = getMetadataValueCountDistinct(
			songs,
			Song_MetadataTag.ARTIST,
		);
		expect(result).toBe(2);
	});

	it("should return 0 for empty songs array", () => {
		const result = getMetadataValueCountDistinct([], Song_MetadataTag.ARTIST);
		expect(result).toBe(0);
	});
});

describe("getSongsTotalDuration", () => {
	it("should sum the durations of the songs", () => {
		const songs = [
			createSongWithDuration({ seconds: 120.5 }),
			createSongWithDuration({ seconds: 60 }),
		];

		expect(getSongsTotalDuration(songs)).toBe(180.5);
	});

	it("should skip durations that are not numbers", () => {
		const songs = [
			createSongWithDuration({ seconds: 30 }),
			createSongWithDuration({ text: "unknown" }),
		];

		expect(getSongsTotalDuration(songs)).toBe(30);
	});

	it("should skip songs without a duration", () => {
		const songs = [createSongWithDuration({ seconds: 45 }), create(SongSchema)];

		expect(getSongsTotalDuration(songs)).toBe(45);
	});

	it("should return 0 for empty songs array", () => {
		expect(getSongsTotalDuration([])).toBe(0);
	});
});
