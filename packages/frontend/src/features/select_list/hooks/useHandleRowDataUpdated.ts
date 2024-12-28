import { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Custom hook to handle row data updates in a grid.
 * @param onLoadingCompleted A function to be called when loading is complete.
 * @returns A callback function to be used for the onRowDataUpdated event.
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
