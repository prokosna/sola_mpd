import { useMemo } from "react";

import {
  SelectListColumnDefinition,
  SelectListRowData,
} from "../types/selectListTypes";

/**
 * Custom hook to prepare data for AG Grid in a select list.
 * @param values An array of string values to be displayed in the grid.
 * @param headerTitle Optional header text for the column. If not provided, "header" is used as default.
 * @returns An object containing rowData and columnDefs for AG Grid.
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
