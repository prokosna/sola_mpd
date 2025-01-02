import type { CellContextMenuEvent } from "ag-grid-community";
import { useCallback } from "react";
import { type TriggerEvent, useContextMenu } from "react-contexify";

import type {
	SelectListContextMenuItemParams,
	SelectListRowValue,
} from "../types/selectListTypes";

/**
 * Create context menu handler.
 *
 * @param id Menu ID
 * @returns Context menu handler
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
