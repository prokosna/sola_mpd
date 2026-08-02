import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	buildSongTableColumnLayout,
	songTableColumnLayoutKeyForTag,
} from "./songTableColumnLayout";

describe("songTableColumnLayoutKeyForTag", () => {
	it("round-trips distinct tags to distinct keys", () => {
		expect(songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)).not.toBe(
			songTableColumnLayoutKeyForTag(Song_MetadataTag.ARTIST),
		);
	});
});

describe("buildSongTableColumnLayout", () => {
	it("captures width, sort order and sort direction per tag", () => {
		const columns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
				isSortDesc: true,
				widthFlex: 150,
			}),
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.ARTIST,
				isSortDesc: false,
				widthFlex: 100,
			}),
		];

		const layout = buildSongTableColumnLayout(columns);

		expect(
			layout[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)],
		).toEqual({ widthFlex: 150, sortOrder: 0, isSortDesc: true });
		expect(
			layout[songTableColumnLayoutKeyForTag(Song_MetadataTag.ARTIST)],
		).toEqual({ widthFlex: 100, sortOrder: undefined, isSortDesc: false });
	});

	it("returns an empty layout for an empty column list", () => {
		expect(buildSongTableColumnLayout([])).toEqual({});
	});
});
