import { useMemo } from "react";

export function useAgGridReactData(values: string[], header?: string) {
  const rowData = useMemo(() => {
    return values.map((value) => ({ key: value, [header ?? "header"]: value }));
  }, [header, values]);

  const columnDefs = useMemo(() => {
    return [
      {
        field: header ?? "header",
        flex: 1,
        resizable: false,
        sortable: false,
        cellDataType: false,
      },
    ];
  }, [header]);

  return {
    rowData,
    columnDefs,
  };
}
