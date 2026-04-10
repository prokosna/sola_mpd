import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { AgGridEvent } from "ag-grid-community";
import { useCallback } from "react";

import {
	convertAgGridColumnsToSongTableColumns,
	copySortingAttributesToNewColumns,
} from "../functions/songTableColumn";

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
