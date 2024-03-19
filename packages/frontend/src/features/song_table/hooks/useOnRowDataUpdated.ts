import { RowDataUpdatedEvent } from "ag-grid-community";
import { useCallback } from "react";

export function useOnRowDataUpdated(onCompleteLoading: () => Promise<void>) {
  return useCallback(
    (_: RowDataUpdatedEvent) => {
      onCompleteLoading();
    },
    [onCompleteLoading],
  );
}
