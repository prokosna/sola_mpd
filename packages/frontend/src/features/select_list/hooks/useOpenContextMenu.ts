import { CellContextMenuEvent } from "ag-grid-community";
import { useCallback } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import {
  SelectListContextMenuItemParams,
  SelectListRowValue,
} from "../types/selectListTypes";

/**
 * Custom hook to create a context menu opener for a select list.
 * @param id - Unique identifier for the context menu.
 * @returns A callback function to open the context menu.
 */
export function useOpenContextMenu(id: string) {
  const contextMenu = useContextMenu({ id });
  return useCallback(
    (event: CellContextMenuEvent) => {
      const { api, data } = event;
      const clickedValue: SelectListRowValue | undefined = data.key;
      if (clickedValue === undefined) {
        return;
      }

      const selectedValues: SelectListRowValue[] = [];
      const values: SelectListRowValue[] = [];
      api.forEachNodeAfterFilterAndSort((node) => {
        values.push(node.data.key);
        if (node.isSelected()) {
          selectedValues.push(node.data.key);
        }
      });

      const props: SelectListContextMenuItemParams = {
        clickedValue,
        selectedValues,
        values,
      };

      contextMenu.show({
        event: event.event as TriggerEvent,
        props,
      });
    },
    [contextMenu],
  );
}
