import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import type { SongTableColumnView } from "../types/songTableTypes";
import { copySortingAttributesToNewColumns } from "./songTableColumn";

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

describe("songTableColumn", () => {
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
});
