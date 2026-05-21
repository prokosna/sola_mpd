import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { mapSortKeyToMetadataTag } from "./mapSortKeyToMetadataTag.js";

describe("mapSortKeyToMetadataTag", () => {
	it.each([
		["title", Song_MetadataTag.TITLE],
		["artist", Song_MetadataTag.ARTIST],
		["album", Song_MetadataTag.ALBUM],
		["date", Song_MetadataTag.DATE],
		["added", Song_MetadataTag.ADDED_AT],
		["updated", Song_MetadataTag.UPDATED_AT],
	] as const)("maps %s sort key to its Song_MetadataTag", (key, expected) => {
		expect(mapSortKeyToMetadataTag(key)).toBe(expected);
	});

	it("returns UNKNOWN for undefined", () => {
		expect(mapSortKeyToMetadataTag(undefined)).toBe(Song_MetadataTag.UNKNOWN);
	});
});
