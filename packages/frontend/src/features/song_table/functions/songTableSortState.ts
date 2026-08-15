import type { SongTableColumnView } from "../types/songTableTypes";
import { convertSongMetadataTagToDisplayName } from "./songTableConversion";

/** AG Grid's per-column sort state, narrowed to what a song table sets. */
export type SongTableColumnSortState = {
	colId: string;
	sort: "asc" | "desc" | null;
	sortIndex: number | null;
};

export function buildColumnSortState(
	columns: SongTableColumnView[],
): SongTableColumnSortState[] {
	return columns.map((column) => {
		const isSorted = column.sortOrder !== undefined && column.sortOrder >= 0;
		return {
			colId: convertSongMetadataTagToDisplayName(column.tag),
			sort: isSorted ? (column.isSortDesc ? "desc" : "asc") : null,
			sortIndex: isSorted ? (column.sortOrder ?? null) : null,
		};
	});
}

/**
 * Whether the grid's sort differs from what the columns ask for. A column the
 * columns say nothing about counts as unsorted, so a sort left over from a
 * previous set of columns registers as a difference.
 */
export function needsColumnSortStateUpdate(
	current: SongTableColumnSortState[],
	desired: SongTableColumnSortState[],
): boolean {
	const desiredByColId = new Map(desired.map((state) => [state.colId, state]));
	return current.some((state) => {
		const expected = desiredByColId.get(state.colId);
		if (expected === undefined) {
			return state.sort !== null;
		}
		return (
			state.sort !== expected.sort || state.sortIndex !== expected.sortIndex
		);
	});
}
