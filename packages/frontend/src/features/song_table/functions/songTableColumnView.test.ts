import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import type { SongTableDeviceLayout } from "../types/songTableTypes";
import {
	buildDeviceSortFromColumnViews,
	buildWidthFlexByTagFromColumnViews,
	composeSearchSongTableColumnView,
	composeSongTableColumnView,
} from "./songTableColumnView";

describe("composeSongTableColumnView", () => {
	it("takes tag order from the workspace and width/sort from the device", () => {
		const deviceLayout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.TITLE]: 250 },
			sort: [{ tag: Song_MetadataTag.TITLE, isDesc: true }],
		};

		const result = composeSongTableColumnView(
			[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			deviceLayout,
		);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.TITLE,
				widthFlex: 250,
				sortOrder: 0,
				isSortDesc: true,
			},
			{
				tag: Song_MetadataTag.ARTIST,
				widthFlex: 1,
				sortOrder: undefined,
				isSortDesc: false,
			},
		]);
	});

	it("never falls back to a workspace width or sort for a tag with no device entry", () => {
		const deviceLayout: SongTableDeviceLayout = {
			widthFlexByTag: {},
			sort: [],
		};

		const result = composeSongTableColumnView(
			[Song_MetadataTag.ALBUM],
			deviceLayout,
		);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.ALBUM,
				widthFlex: 1,
				sortOrder: undefined,
				isSortDesc: false,
			},
		]);
	});

	it("assigns sortOrder by position in the device sort list", () => {
		const deviceLayout: SongTableDeviceLayout = {
			widthFlexByTag: {},
			sort: [
				{ tag: Song_MetadataTag.ARTIST, isDesc: false },
				{ tag: Song_MetadataTag.TITLE, isDesc: true },
			],
		};

		const result = composeSongTableColumnView(
			[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			deviceLayout,
		);

		expect(result[0]).toMatchObject({
			tag: Song_MetadataTag.TITLE,
			sortOrder: 1,
		});
		expect(result[1]).toMatchObject({
			tag: Song_MetadataTag.ARTIST,
			sortOrder: 0,
		});
	});
});

describe("composeSearchSongTableColumnView", () => {
	it("keeps tag and sort from the search's own columns, overlaying only the device width", () => {
		const columns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.ALBUM,
				sortOrder: 0,
				isSortDesc: true,
				widthFlex: 0,
			}),
		];
		const deviceLayout: SongTableDeviceLayout = {
			widthFlexByTag: { [Song_MetadataTag.ALBUM]: 555 },
			sort: [],
		};

		const result = composeSearchSongTableColumnView(columns, deviceLayout);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.ALBUM,
				widthFlex: 555,
				sortOrder: 0,
				isSortDesc: true,
			},
		]);
	});

	it("falls back to the default width when the device has no entry for the tag", () => {
		const columns = [
			create(SongTableColumnSchema, {
				tag: Song_MetadataTag.TITLE,
				widthFlex: 0,
			}),
		];

		const result = composeSearchSongTableColumnView(columns, {
			widthFlexByTag: {},
			sort: [],
		});

		expect(result[0].widthFlex).toBe(1);
	});
});

describe("buildDeviceSortFromColumnViews", () => {
	it("orders by sortOrder and drops unsorted columns", () => {
		const result = buildDeviceSortFromColumnViews([
			{
				tag: Song_MetadataTag.ARTIST,
				sortOrder: 1,
				isSortDesc: false,
				widthFlex: 1,
			},
			{
				tag: Song_MetadataTag.TITLE,
				sortOrder: 0,
				isSortDesc: true,
				widthFlex: 1,
			},
			{
				tag: Song_MetadataTag.ALBUM,
				sortOrder: undefined,
				isSortDesc: false,
				widthFlex: 1,
			},
		]);

		expect(result).toEqual([
			{ tag: Song_MetadataTag.TITLE, isDesc: true },
			{ tag: Song_MetadataTag.ARTIST, isDesc: false },
		]);
	});
});

describe("buildWidthFlexByTagFromColumnViews", () => {
	it("maps each column's tag to its width", () => {
		const result = buildWidthFlexByTagFromColumnViews([
			{
				tag: Song_MetadataTag.TITLE,
				sortOrder: undefined,
				isSortDesc: false,
				widthFlex: 200,
			},
			{
				tag: Song_MetadataTag.ARTIST,
				sortOrder: undefined,
				isSortDesc: false,
				widthFlex: 300,
			},
		]);

		expect(result).toEqual({
			[Song_MetadataTag.TITLE]: 200,
			[Song_MetadataTag.ARTIST]: 300,
		});
	});
});
