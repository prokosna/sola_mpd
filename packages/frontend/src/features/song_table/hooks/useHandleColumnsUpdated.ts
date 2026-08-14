import type { AgGridEvent } from "ag-grid-community";
import { useCallback } from "react";

import {
	convertAgGridColumnsToSongTableColumnViews,
	copySortingAttributesToNewColumns,
} from "../functions/songTableColumn";
import type { SongTableColumnView } from "../types/songTableTypes";

export function useHandleColumnsUpdated(
	currentColumns: SongTableColumnView[],
	isSortingEnabled: boolean,
	onColumnsUpdated: (columns: SongTableColumnView[]) => Promise<void>,
): (event: AgGridEvent) => void {
	return useCallback(
		(event: AgGridEvent) => {
			const { api } = event;
			const updatedColumns = convertAgGridColumnsToSongTableColumnViews(
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
