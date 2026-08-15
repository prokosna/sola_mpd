import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	buildDeviceSortFromColumnViews,
	buildWidthFlexByTagFromColumnViews,
	composeSongTableColumnView,
} from "./songTableColumnView";

describe("composeSongTableColumnView", () => {
	it("takes tag order from the argument and width/sort from the given maps", () => {
		const result = composeSongTableColumnView(
			[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			{ [Song_MetadataTag.TITLE]: 250 },
			[{ tag: Song_MetadataTag.TITLE, isDesc: true }],
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

	it("never falls back to some other width or sort for a tag with no entry", () => {
		const result = composeSongTableColumnView([Song_MetadataTag.ALBUM], {}, []);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.ALBUM,
				widthFlex: 1,
				sortOrder: undefined,
				isSortDesc: false,
			},
		]);
	});

	it("assigns sortOrder by position in the sort list", () => {
		const result = composeSongTableColumnView(
			[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
			{},
			[
				{ tag: Song_MetadataTag.ARTIST, isDesc: false },
				{ tag: Song_MetadataTag.TITLE, isDesc: true },
			],
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

	it("composes a search's own tags/sort with the device width, same as a library view", () => {
		const result = composeSongTableColumnView(
			[Song_MetadataTag.ALBUM],
			{ [Song_MetadataTag.ALBUM]: 555 },
			[{ tag: Song_MetadataTag.ALBUM, isDesc: true }],
		);

		expect(result).toEqual([
			{
				tag: Song_MetadataTag.ALBUM,
				widthFlex: 555,
				sortOrder: 0,
				isSortDesc: true,
			},
		]);
	});

	it("resolves width through the fallback chain: override, then shared, then default", () => {
		const result = composeSongTableColumnView(
			[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST, Song_MetadataTag.ALBUM],
			{
				[Song_MetadataTag.TITLE]: 250,
				[Song_MetadataTag.ARTIST]: 300,
			},
			[],
			{ [Song_MetadataTag.TITLE]: 555 },
		);

		expect(result.map((column) => column.widthFlex)).toEqual([
			555, // override wins over the shared width
			300, // no override: falls back to the shared width
			1, // neither map has an entry: falls back to the default
		]);
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
