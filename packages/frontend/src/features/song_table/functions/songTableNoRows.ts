import type { SongTableNoRows } from "../types/songTableTypes";

export const SONG_TABLE_NO_ROWS_FILTERED_MESSAGE = "No songs match the filter.";

export function getSongTableNoRowsMessage(
	noRows: SongTableNoRows,
	isGlobalFilterApplied: boolean,
): string {
	if (noRows.isIdle) {
		return noRows.message;
	}
	if (isGlobalFilterApplied) {
		return SONG_TABLE_NO_ROWS_FILTERED_MESSAGE;
	}
	return noRows.message;
}
