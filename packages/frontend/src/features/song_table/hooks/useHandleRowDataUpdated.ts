import { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Uses a callback function on row date updated.
 * @param onLoadingCompleted Callback function on loading completed.
 * @returns Callback function.
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
