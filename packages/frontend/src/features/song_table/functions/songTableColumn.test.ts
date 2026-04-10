import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	copySortingAttributesToNewColumns,
	ensureTagsContainedInColumns,
	getAverageWidthFlex,
	normalizeSongTableColumns,
} from "./songTableColumn";

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean; widthFlex?: number } = {},
) {
	return create(SongTableColumnSchema, {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: opts.widthFlex ?? 100,
	});
}

describe("songTableColumn", () => {
	describe("getAverageWidthFlex", () => {
		it("should return average of column widths", () => {
			const columns = [
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 100 }),
				createColumn(Song_MetadataTag.ARTIST, { widthFlex: 200 }),
			];
			expect(getAverageWidthFlex(columns)).toBe(150);
		});

		it("should floor the result", () => {
			const columns = [
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 100 }),
				createColumn(Song_MetadataTag.ARTIST, { widthFlex: 101 }),
			];
			expect(getAverageWidthFlex(columns)).toBe(100);
		});

		it("should return 0 for empty array", () => {
			expect(getAverageWidthFlex([])).toBe(0);
		});
	});

	describe("copySortingAttributesToNewColumns", () => {
		it("should copy sort attributes from base columns to matching new columns", () => {
			const base = [
				createColumn(Song_MetadataTag.TITLE, {
					sortOrder: 0,
					isSortDesc: true,
				}),
			];
			const newCols = [
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 200 }),
			];
			const result = copySortingAttributesToNewColumns(newCols, base);
			expect(result[0].sortOrder).toBe(0);
			expect(result[0].isSortDesc).toBe(true);
			expect(result[0].widthFlex).toBe(200);
		});

		it("should leave new columns unchanged when no base match", () => {
			const base = [createColumn(Song_MetadataTag.ARTIST, { sortOrder: 0 })];
			const newCols = [createColumn(Song_MetadataTag.TITLE)];
			const result = copySortingAttributesToNewColumns(newCols, base);
			expect(result[0].sortOrder).toBeUndefined();
		});
	});

	describe("normalizeSongTableColumns", () => {
		it("should resequence sort order from 0", () => {
			const columns = [
				createColumn(Song_MetadataTag.TITLE, { sortOrder: 5 }),
				createColumn(Song_MetadataTag.ARTIST, { sortOrder: 10 }),
			];
			const result = normalizeSongTableColumns(columns);
			expect(result[0].sortOrder).toBe(0);
			expect(result[1].sortOrder).toBe(1);
		});

		it("should not modify columns without sort order", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE)];
			const result = normalizeSongTableColumns(columns);
			expect(result[0].sortOrder).toBeUndefined();
		});
	});

	describe("normalizeSongTableColumns — purity", () => {
		it("should not mutate the input columns", () => {
			const columns = [
				createColumn(Song_MetadataTag.TITLE, { sortOrder: 5 }),
				createColumn(Song_MetadataTag.ARTIST, { sortOrder: 10 }),
			];
			const originalOrders = columns.map((c) => c.sortOrder);
			normalizeSongTableColumns(columns);
			expect(columns.map((c) => c.sortOrder)).toEqual(originalOrders);
		});
	});

	describe("ensureTagsContainedInColumns", () => {
		it("should not mutate the input array", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE)];
			const originalLength = columns.length;
			ensureTagsContainedInColumns(columns, [Song_MetadataTag.ARTIST], 150);
			expect(columns).toHaveLength(originalLength);
		});

		it("should add missing tags with specified width", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE)];
			const result = ensureTagsContainedInColumns(
				columns,
				[Song_MetadataTag.TITLE, Song_MetadataTag.ARTIST],
				150,
			);
			expect(result).toHaveLength(2);
			expect(result[1].tag).toBe(Song_MetadataTag.ARTIST);
			expect(result[1].widthFlex).toBe(150);
		});

		it("should not duplicate existing tags", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE)];
			const result = ensureTagsContainedInColumns(
				columns,
				[Song_MetadataTag.TITLE],
				150,
			);
			expect(result).toHaveLength(1);
		});
	});
});
