import { create } from "@bufbuild/protobuf";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import type { GridApi, IRowNode } from "ag-grid-community";
import { describe, expect, it } from "vitest";

import { getSongsInTableFromGrid, getTableIndexOfSong } from "./songTableState";

type FakeRow = {
	key: string;
	selected?: boolean;
	rowIndex?: number | null;
};

function createGridApi(rows: FakeRow[]): GridApi {
	const nodes = rows.map(
		(row, i) =>
			({
				id: row.key,
				data: { key: row.key },
				rowIndex: row.rowIndex === undefined ? i : row.rowIndex,
				isSelected: () => row.selected ?? false,
			}) as unknown as IRowNode,
	);
	return {
		forEachNodeAfterFilterAndSort: (callback: (node: IRowNode) => void) => {
			nodes.forEach(callback);
		},
	} as unknown as GridApi;
}

function createSongsMap(keys: string[]): Map<string, Song> {
	return new Map(keys.map((key) => [key, create(SongSchema, { path: key })]));
}

describe("getSongsInTableFromGrid", () => {
	it("returns songs in grid order with the selected subset", () => {
		const gridApi = createGridApi([
			{ key: "c", selected: true },
			{ key: "a" },
			{ key: "b", selected: true },
		]);
		const songsMap = createSongsMap(["a", "b", "c"]);

		const result = getSongsInTableFromGrid(undefined, gridApi, songsMap);

		expect(result.clickedSong).toBeUndefined();
		expect(result.sortedSongs.map((s) => s.path)).toEqual(["c", "a", "b"]);
		expect(result.selectedSortedSongs.map((s) => s.path)).toEqual(["c", "b"]);
	});

	it("resolves the clicked song by key", () => {
		const gridApi = createGridApi([{ key: "a" }, { key: "b" }]);
		const songsMap = createSongsMap(["a", "b"]);

		const result = getSongsInTableFromGrid("b", gridApi, songsMap);

		expect(result.clickedSong?.path).toBe("b");
	});

	it("leaves the clicked song undefined when the key is not in the grid", () => {
		const gridApi = createGridApi([{ key: "a" }]);
		const songsMap = createSongsMap(["a"]);

		const result = getSongsInTableFromGrid("missing", gridApi, songsMap);

		expect(result.clickedSong).toBeUndefined();
		expect(result.sortedSongs).toHaveLength(1);
	});

	it("throws when a grid row has no matching song", () => {
		const gridApi = createGridApi([{ key: "a" }]);

		expect(() =>
			getSongsInTableFromGrid(undefined, gridApi, new Map()),
		).toThrow("No song found for key=a.");
	});
});

describe("getTableIndexOfSong", () => {
	it("returns the row index of the song", () => {
		const gridApi = createGridApi([
			{ key: "a", rowIndex: 0 },
			{ key: "b", rowIndex: 5 },
		]);

		expect(getTableIndexOfSong("b", gridApi)).toBe(5);
	});

	it("returns undefined when the song is not in the grid", () => {
		const gridApi = createGridApi([{ key: "a" }]);

		expect(getTableIndexOfSong("missing", gridApi)).toBeUndefined();
	});

	it("ignores nodes without a row index", () => {
		const gridApi = createGridApi([{ key: "a", rowIndex: null }]);

		expect(getTableIndexOfSong("a", gridApi)).toBeUndefined();
	});
});
