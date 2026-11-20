import type { GridApi, IRowNode } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { type RefObject, useCallback, useEffect } from "react";

import type { SelectListRowValue } from "../types/selectListTypes";

// selectedValues can be restored from the URL before the grid exists or has
// rows, so the returned function must also run whenever row data lands.
export function useSyncSelectedValues(
	gridRef: RefObject<AgGridReact | null>,
	selectedValues: SelectListRowValue[],
): (api: GridApi) => void {
	const syncSelectedValues = useCallback(
		(api: GridApi) => {
			const selectedSet = new Set(selectedValues);
			const nodesToSelect: IRowNode[] = [];
			const nodesToDeselect: IRowNode[] = [];
			api.forEachNode((node) => {
				const value = String(node.data.key);
				if (node.isSelected() && !selectedSet.has(value)) {
					nodesToDeselect.push(node);
				} else if (!node.isSelected() && selectedSet.has(value)) {
					nodesToSelect.push(node);
				}
			});
			if (nodesToDeselect.length > 0) {
				api.setNodesSelected({ nodes: nodesToDeselect, newValue: false });
			}
			if (nodesToSelect.length > 0) {
				api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
			}
		},
		[selectedValues],
	);

	useEffect(() => {
		const api = gridRef.current?.api;
		if (api !== undefined) {
			syncSelectedValues(api);
		}
	}, [gridRef, syncSelectedValues]);

	return syncSelectedValues;
}
