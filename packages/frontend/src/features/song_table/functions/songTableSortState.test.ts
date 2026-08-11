import { create } from "@bufbuild/protobuf";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { describe, expect, it } from "vitest";

import {
	buildColumnSortState,
	needsColumnSortStateUpdate,
	type SongTableColumnSortState,
} from "./songTableSortState";

function createColumn(
	tag: Song_MetadataTag,
	opts: { sortOrder?: number; isSortDesc?: boolean } = {},
) {
	return create(SongTableColumnSchema, {
		tag,
		sortOrder: opts.sortOrder,
		isSortDesc: opts.isSortDesc ?? false,
		widthFlex: 100,
	});
}

describe("buildColumnSortState", () => {
	it("maps a sorted column to its direction and index", () => {
		const state = buildColumnSortState([
			createColumn(Song_MetadataTag.ALBUM, { sortOrder: 0, isSortDesc: true }),
		]);

		expect(state).toEqual([{ colId: "Album", sort: "desc", sortIndex: 0 }]);
	});

	it("maps an unsorted column to a cleared sort", () => {
		const state = buildColumnSortState([createColumn(Song_MetadataTag.TITLE)]);

		expect(state).toEqual([{ colId: "Title", sort: null, sortIndex: null }]);
	});

	// -1 is the proto's "unselected" placeholder, not a real index.
	it("treats a negative sort order as unsorted", () => {
		const state = buildColumnSortState([
			createColumn(Song_MetadataTag.TITLE, { sortOrder: -1 }),
		]);

		expect(state[0].sort).toBeNull();
	});
});

describe("needsColumnSortStateUpdate", () => {
	const desired: SongTableColumnSortState[] = [
		{ colId: "Album", sort: "asc", sortIndex: 0 },
		{ colId: "Title", sort: null, sortIndex: null },
	];

	it("is false when the grid already matches", () => {
		expect(needsColumnSortStateUpdate(desired, desired)).toBe(false);
	});

	it("is true when the grid sorts a column the columns leave unsorted", () => {
		const current: SongTableColumnSortState[] = [
			{ colId: "Album", sort: "asc", sortIndex: 0 },
			{ colId: "Title", sort: "desc", sortIndex: 1 },
		];

		expect(needsColumnSortStateUpdate(current, desired)).toBe(true);
	});

	it("is true when the direction differs", () => {
		const current: SongTableColumnSortState[] = [
			{ colId: "Album", sort: "desc", sortIndex: 0 },
			{ colId: "Title", sort: null, sortIndex: null },
		];

		expect(needsColumnSortStateUpdate(current, desired)).toBe(true);
	});

	// A column the new set does not mention keeps its sort unless it is noticed.
	it("is true when the grid still sorts a column that is no longer present", () => {
		const current: SongTableColumnSortState[] = [
			{ colId: "Album", sort: "asc", sortIndex: 0 },
			{ colId: "Genre", sort: "asc", sortIndex: 1 },
		];

		expect(needsColumnSortStateUpdate(current, desired)).toBe(true);
	});
});
