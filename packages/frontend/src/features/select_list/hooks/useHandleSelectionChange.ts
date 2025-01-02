import { SelectionChangedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { SelectListRowValue } from "../types/selectListTypes";

/**
 * Handle AG Grid selection changes.
 *
 * @param onItemsSelected Selection callback
 * @returns Selection change handler
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
