import { useMemo } from "react";

import type {
	SelectListColumnDefinition,
	SelectListRowData,
} from "../types/selectListTypes";

/**
 * Format data for AG Grid.
 *
 * @param values Values to display
 * @param headerTitle Optional header
 * @returns Row data and column definitions
 */
export function useAgGridReactData(values: string[], headerTitle?: string) {
	const rowData: SelectListRowData[] = useMemo(() => {
		return values.map((value) => ({
			key: value,
			[headerTitle ?? "header"]: value,
		}));
	}, [headerTitle, values]);

	const columnDefs: SelectListColumnDefinition[] = useMemo(() => {
		return [
			{
				field: headerTitle ?? "header",
				flex: 1,
				resizable: false,
				sortable: false,
				cellDataType: false,
			},
		];
	}, [headerTitle]);

	return {
		rowData,
		columnDefs,
	};
}
