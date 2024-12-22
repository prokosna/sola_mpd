import { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

/**
 * Uses a callback function on row date updated.
 * @param onCompleteLoading Callback function on loading completed.
 * @returns Callback function.
 */
export function useOnRowDataUpdated(
  onCompleteLoading: () => Promise<void>,
): (event: RowDataUpdatedEvent) => void {
  return useCallback(
    (_: RowDataUpdatedEvent) => {
      onCompleteLoading();
    },
    [onCompleteLoading],
  );
}
