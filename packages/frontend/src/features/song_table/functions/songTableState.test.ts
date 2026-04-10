import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	SongTableColumnSchema,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import { createNewSongTableStateFromColumns } from "./songTableState";

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

describe("songTableState", () => {
	describe("createNewSongTableStateFromColumns", () => {
		it("should use columns directly when sorting is enabled", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE, { sortOrder: 0 })];
			const baseState = create(SongTableStateSchema, {
				columns: [createColumn(Song_MetadataTag.ARTIST)],
			});
			const result = createNewSongTableStateFromColumns(
				columns,
				baseState,
				true,
			);
			expect(result.columns).toEqual(columns);
		});

		it("should copy sorting from base state when sorting is disabled", () => {
			const columns = [
				createColumn(Song_MetadataTag.TITLE, { widthFlex: 200 }),
			];
			const baseState = create(SongTableStateSchema, {
				columns: [
					createColumn(Song_MetadataTag.TITLE, {
						sortOrder: 0,
						isSortDesc: true,
					}),
				],
			});
			const result = createNewSongTableStateFromColumns(
				columns,
				baseState,
				false,
			);
			expect(result.columns[0].sortOrder).toBe(0);
			expect(result.columns[0].isSortDesc).toBe(true);
			expect(result.columns[0].widthFlex).toBe(200);
		});

		it("should not mutate the base state", () => {
			const columns = [createColumn(Song_MetadataTag.TITLE)];
			const baseState = create(SongTableStateSchema, {
				columns: [createColumn(Song_MetadataTag.ARTIST)],
			});
			createNewSongTableStateFromColumns(columns, baseState, true);
			expect(baseState.columns[0].tag).toBe(Song_MetadataTag.ARTIST);
		});
	});
});
