import type { GridApi, RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

export function useHandleRowDataUpdated(
	onLoadingCompleted: () => Promise<void>,
	syncSelectedValues: (api: GridApi) => void,
) {
	return useCallback(
		(event: RowDataUpdatedEvent) => {
			syncSelectedValues(event.api);
			onLoadingCompleted();
		},
		[onLoadingCompleted, syncSelectedValues],
	);
}
