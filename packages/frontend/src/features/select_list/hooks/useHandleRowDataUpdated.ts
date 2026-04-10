import type { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

export function useHandleRowDataUpdated(
	onLoadingCompleted: () => Promise<void>,
) {
	return useCallback(
		(_: RowDataUpdatedEvent) => {
			onLoadingCompleted();
		},
		[onLoadingCompleted],
	);
}
