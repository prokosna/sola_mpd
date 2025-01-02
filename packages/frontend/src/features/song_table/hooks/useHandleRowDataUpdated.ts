import type { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Creates handler for AG Grid row data updates.
 *
 * Triggers loading completion callback when row data is fully
 * updated, ensuring proper synchronization of loading states
 * with data changes.
 *
 * @param onLoadingCompleted Loading completion callback
 * @returns Row data update handler
 */
export function useHandleRowDataUpdated(
	onLoadingCompleted: () => Promise<void>,
): (event: RowDataUpdatedEvent) => void {
	return useCallback(
		(_: RowDataUpdatedEvent) => {
			onLoadingCompleted();
		},
		[onLoadingCompleted],
	);
}
