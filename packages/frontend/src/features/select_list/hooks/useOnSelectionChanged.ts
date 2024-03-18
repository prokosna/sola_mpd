import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

export function useOnSelectionChanged(
  onSelectSongs: (selectedValues: string[]) => Promise<void>,
) {
  return useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;

      const selectedValues: string[] = [];
      api.forEachNodeAfterFilterAndSort((node) => {
        if (node.isSelected()) {
          selectedValues.push(node.data.key);
        }
      });
      onSelectSongs(selectedValues);
    },
    [onSelectSongs],
  );
}
