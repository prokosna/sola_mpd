import type { AgGridReact } from "ag-grid-react";
import { type RefObject, useEffect } from "react";

import {
	buildColumnSortState,
	needsColumnSortStateUpdate,
} from "../functions/songTableSortState";
import type { SongTableColumnView } from "../types/songTableTypes";

/**
 * AG Grid reads `sort` off a column definition only when it creates the column,
 * and keeps its own sort state across later updates, so columns arriving from
 * elsewhere would leave whatever the user last sorted by in place. Applied only
 * on a difference, so the user's own sort is not re-applied to itself.
 */
export function useSyncColumnSortState(
	gridRef: RefObject<AgGridReact | null>,
	columns: SongTableColumnView[],
	isEnabled: boolean,
): void {
	useEffect(() => {
		if (!isEnabled) {
			return;
		}
		const api = gridRef.current?.api;
		if (api === undefined || api.isDestroyed()) {
			return;
		}

		const desired = buildColumnSortState(columns);
		const current = api.getColumnState().map((state) => ({
			colId: state.colId,
			sort: state.sort ?? null,
			sortIndex: state.sortIndex ?? null,
		}));
		if (!needsColumnSortStateUpdate(current, desired)) {
			return;
		}

		api.applyColumnState({ state: desired, defaultState: { sort: null } });
	}, [gridRef, columns, isEnabled]);
}
