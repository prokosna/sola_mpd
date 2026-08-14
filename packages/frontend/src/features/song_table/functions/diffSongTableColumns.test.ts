import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { SongTableColumnView } from "../types/songTableTypes";
import { diffSongTableColumns } from "./diffSongTableColumns";

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean; widthFlex?: number } = {},
): SongTableColumnView {
	return {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: opts.widthFlex ?? 100,
	};
}

describe("diffSongTableColumns", () => {
	it("reports no changes for identical column lists", () => {
		const columns = [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0 }),
			createColumn(Song_MetadataTag.ARTIST),
		];

		expect(diffSongTableColumns(columns, columns)).toEqual({
			tagsChanged: false,
			sortChanged: false,
			widthChanged: false,
		});
	});

	it("sets tagsChanged when the same tags are reordered without any other change", () => {
		const prev = [
			createColumn(Song_MetadataTag.TITLE),
			createColumn(Song_MetadataTag.ARTIST),
		];
		const next = [
			createColumn(Song_MetadataTag.ARTIST),
			createColumn(Song_MetadataTag.TITLE),
		];

		expect(diffSongTableColumns(prev, next)).toEqual({
			tagsChanged: true,
			sortChanged: false,
			widthChanged: false,
		});
	});

	it("sets tagsChanged when a column is added", () => {
		const prev = [createColumn(Song_MetadataTag.TITLE)];
		const next = [
			createColumn(Song_MetadataTag.TITLE),
			createColumn(Song_MetadataTag.ARTIST),
		];

		expect(diffSongTableColumns(prev, next).tagsChanged).toBe(true);
	});

	it("sets tagsChanged when a column is removed", () => {
		const prev = [
			createColumn(Song_MetadataTag.TITLE),
			createColumn(Song_MetadataTag.ARTIST),
		];
		const next = [createColumn(Song_MetadataTag.TITLE)];

		expect(diffSongTableColumns(prev, next).tagsChanged).toBe(true);
	});

	it("sets only sortChanged when sort_order changes and nothing else does", () => {
		const prev = [createColumn(Song_MetadataTag.TITLE, { sortOrder: 0 })];
		const next = [createColumn(Song_MetadataTag.TITLE, { sortOrder: 1 })];

		expect(diffSongTableColumns(prev, next)).toEqual({
			tagsChanged: false,
			sortChanged: true,
			widthChanged: false,
		});
	});

	it("sets only sortChanged when is_sort_desc changes and nothing else does", () => {
		const prev = [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, isSortDesc: false }),
		];
		const next = [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, isSortDesc: true }),
		];

		expect(diffSongTableColumns(prev, next)).toEqual({
			tagsChanged: false,
			sortChanged: true,
			widthChanged: false,
		});
	});

	it("sets only widthChanged when width_flex changes and nothing else does", () => {
		const prev = [createColumn(Song_MetadataTag.TITLE, { widthFlex: 100 })];
		const next = [createColumn(Song_MetadataTag.TITLE, { widthFlex: 200 })];

		expect(diffSongTableColumns(prev, next)).toEqual({
			tagsChanged: false,
			sortChanged: false,
			widthChanged: true,
		});
	});

	it("sets both sortChanged and widthChanged independently when both change", () => {
		const prev = [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 0, widthFlex: 100 }),
		];
		const next = [
			createColumn(Song_MetadataTag.TITLE, { sortOrder: 1, widthFlex: 200 }),
		];

		expect(diffSongTableColumns(prev, next)).toEqual({
			tagsChanged: false,
			sortChanged: true,
			widthChanged: true,
		});
	});
});
