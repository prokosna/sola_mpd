import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	applyColumnWidthsToLayout,
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

describe("applyColumnWidthsToLayout", () => {
	it("updates widths while preserving the sort already recorded for a tag", () => {
		const layout = buildSongTableColumnLayout([
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
				isSortDesc: true,
				widthFlex: 150,
			}),
		]);

		// The same tag as the Search view would report it: its own sort, which
		// must not reach the device layout.
		const updated = applyColumnWidthsToLayout(layout, [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				sortOrder: 3,
				isSortDesc: false,
				widthFlex: 400,
			}),
		]);

		expect(
			updated[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)],
		).toEqual({ widthFlex: 400, sortOrder: 0, isSortDesc: true });
	});

	it("records a width for a tag the layout has never seen, with no sort", () => {
		const updated = applyColumnWidthsToLayout({}, [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.ALBUM,
				sortOrder: 2,
				isSortDesc: true,
				widthFlex: 220,
			}),
		]);

		expect(
			updated[songTableColumnLayoutKeyForTag(Song_MetadataTag.ALBUM)],
		).toEqual({ widthFlex: 220, sortOrder: undefined, isSortDesc: false });
	});

	it("leaves entries for tags outside the column list untouched", () => {
		const layout = buildSongTableColumnLayout([
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.ARTIST,
				sortOrder: 1,
				isSortDesc: true,
				widthFlex: 100,
			}),
		]);

		const updated = applyColumnWidthsToLayout(layout, [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 50,
				isSortDesc: false,
			}),
		]);

		expect(
			updated[songTableColumnLayoutKeyForTag(Song_MetadataTag.ARTIST)],
		).toEqual({ widthFlex: 100, sortOrder: 1, isSortDesc: true });
	});

	it("does not mutate the input layout", () => {
		const layout = buildSongTableColumnLayout([
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 150,
				isSortDesc: false,
			}),
		]);

		applyColumnWidthsToLayout(layout, [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 999,
				isSortDesc: false,
			}),
		]);

		expect(
			layout[songTableColumnLayoutKeyForTag(Song_MetadataTag.TITLE)].widthFlex,
		).toBe(150);
	});
});
