import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type { AgGridEvent } from "ag-grid-community";
import { useCallback } from "react";

import {
	convertAgGridColumnsToSongTableColumns,
	copySortingAttributesToNewColumns,
} from "../utils/songTableColumnUtils";

/**
 * Creates handler for AG Grid column updates.
 *
 * Converts AG Grid column state to SongTableColumns format,
 * preserving sorting attributes when needed. Ensures column
 * configuration stays synchronized.
 *
 * @param currentColumns Current column config
 * @param isSortingEnabled Sorting enabled flag
 * @param onColumnsUpdated Update callback
 * @returns Column update handler
 */
export function useHandleColumnsUpdated(
	currentColumns: SongTableColumn[],
	isSortingEnabled: boolean,
	onColumnsUpdated: (columns: SongTableColumn[]) => Promise<void>,
): (event: AgGridEvent) => void {
	return useCallback(
		(event: AgGridEvent) => {
			const { api } = event;
			const updatedColumns = convertAgGridColumnsToSongTableColumns(
				api.getAllGridColumns(),
			);
			const newColumns = isSortingEnabled
				? updatedColumns
				: copySortingAttributesToNewColumns(updatedColumns, currentColumns);
			onColumnsUpdated(newColumns);
		},
		[currentColumns, isSortingEnabled, onColumnsUpdated],
	);
}
