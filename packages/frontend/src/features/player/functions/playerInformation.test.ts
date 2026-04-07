import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { formatSongInformationLines } from "./playerInformation";

const ALL_TAGS = [
	Song_MetadataTag.TITLE,
	Song_MetadataTag.ALBUM,
	Song_MetadataTag.ARTIST,
	Song_MetadataTag.ALBUM_ARTIST,
	Song_MetadataTag.COMPOSER,
	Song_MetadataTag.DATE,
];

function createStringValue(value: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value }),
		},
	});
}

function createSong(values: Partial<Record<Song_MetadataTag, string>> = {}) {
	const metadata: Record<
		number,
		ReturnType<typeof create<typeof Song_MetadataValueSchema>>
	> = {};
	for (const tag of ALL_TAGS) {
		metadata[tag] = createStringValue(values[tag] ?? "");
	}
	return create(SongSchema, { metadata });
}

describe("playerInformation", () => {
	describe("formatSongInformationLines", () => {
		it("should return 'Not playing' when song is undefined", () => {
			const result = formatSongInformationLines(undefined);
			expect(result.firstLine).toBe("Not playing");
			expect(result.secondLine).toBe("");
			expect(result.thirdLine).toBe("");
		});

		it("should format song with all metadata", () => {
			const song = createSong({
				[Song_MetadataTag.TITLE]: "Test Title",
				[Song_MetadataTag.ALBUM]: "Test Album",
				[Song_MetadataTag.ARTIST]: "Test Artist",
				[Song_MetadataTag.COMPOSER]: "Test Composer",
				[Song_MetadataTag.DATE]: "2024",
			});
			const result = formatSongInformationLines(song);
			expect(result.firstLine).toBe("Test Title");
			expect(result.secondLine).toBe("Test Album");
			expect(result.thirdLine).toBe("Test Artist / Test Composer (2024)");
		});

		it("should use album artist when artist is missing", () => {
			const song = createSong({
				[Song_MetadataTag.TITLE]: "Test Title",
				[Song_MetadataTag.ALBUM_ARTIST]: "Album Artist",
			});
			const result = formatSongInformationLines(song);
			expect(result.thirdLine).toBe("Album Artist");
		});
	});
});
