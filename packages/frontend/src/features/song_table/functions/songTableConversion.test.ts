import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	convertSongMetadataTagFromDisplayName,
	convertSongMetadataTagToDisplayName,
} from "./songTableConversion";

describe("songTableConversion", () => {
	describe("convertSongMetadataTagToDisplayName", () => {
		it("should convert single-word tag", () => {
			expect(convertSongMetadataTagToDisplayName(Song_MetadataTag.TITLE)).toBe(
				"Title",
			);
		});

		it("should convert multi-word tag", () => {
			expect(
				convertSongMetadataTagToDisplayName(Song_MetadataTag.ALBUM_ARTIST),
			).toBe("Album Artist");
		});
	});

	describe("convertSongMetadataTagFromDisplayName", () => {
		it("should convert display name back to tag", () => {
			expect(convertSongMetadataTagFromDisplayName("Title")).toBe(
				Song_MetadataTag.TITLE,
			);
		});

		it("should convert multi-word display name", () => {
			expect(convertSongMetadataTagFromDisplayName("Album Artist")).toBe(
				Song_MetadataTag.ALBUM_ARTIST,
			);
		});

		it("should return undefined for unknown display name", () => {
			expect(
				convertSongMetadataTagFromDisplayName("Not A Real Tag"),
			).toBeUndefined();
		});
	});
});
