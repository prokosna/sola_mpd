import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { tagNameToMetadataTag } from "./tagNameToMetadataTag.js";

describe("tagNameToMetadataTag", () => {
	it.each([
		["artist", Song_MetadataTag.ARTIST],
		["album_artist", Song_MetadataTag.ALBUM_ARTIST],
		["album", Song_MetadataTag.ALBUM],
		["genre", Song_MetadataTag.GENRE],
		["composer", Song_MetadataTag.COMPOSER],
		["label", Song_MetadataTag.LABEL],
		["title", Song_MetadataTag.TITLE],
	] as const)("maps %s to its Song_MetadataTag", (name, expected) => {
		expect(tagNameToMetadataTag(name)).toBe(expected);
	});
});
