import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SelectListRowValue } from "../types/selectListTypes";

/**
 * Custom hook that returns a callback function for handling selection changes in a grid.
 * @param onItemsSelected A function that takes an array of selected values and returns a Promise.
 * @returns A callback function that can be used as an event handler for selection changes.
 */
export function useHandleSelectionChange(
  onItemsSelected: (selectedValues: SelectListRowValue[]) => Promise<void>,
) {
  return useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;

      const selectedValues: SelectListRowValue[] = [];
      api.forEachNodeAfterFilterAndSort((node) => {
        if (node.isSelected()) {
          selectedValues.push(node.data.key);
        }
      });
      onItemsSelected(selectedValues);
    },
    [onItemsSelected],
  );
}
