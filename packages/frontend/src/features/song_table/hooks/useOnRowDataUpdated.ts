import { RowDataUpdatedEvent } from "ag-grid-community";

export function useOnRowDataUpdated(
  completeLoadingAction: () => Promise<void>,
) {
  return (_: RowDataUpdatedEvent) => {
    completeLoadingAction();
  };
}
