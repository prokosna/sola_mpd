import { CellContextMenuEvent } from "ag-grid-community";
import { useCallback } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { SelectListContextMenuItemParams } from "../types/selectList";

export function useOnOpenContextMenu(id: string) {
  const contextMenu = useContextMenu({ id });
  return useCallback(
    (event: CellContextMenuEvent) => {
      const { api, data } = event;
      const clickedValue: string | undefined = data.key;
      if (clickedValue === undefined) {
        return;
      }

      const selectedValues: string[] = [];
      const values: string[] = [];
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
