import type { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Handle AG Grid row data updates.
 *
 * @param onLoadingCompleted Loading callback
 * @returns Row data update handler
 */
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
