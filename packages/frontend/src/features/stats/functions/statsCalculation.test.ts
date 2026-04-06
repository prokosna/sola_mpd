import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { getMetadataValueCountDistinct } from "./statsCalculation";

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
