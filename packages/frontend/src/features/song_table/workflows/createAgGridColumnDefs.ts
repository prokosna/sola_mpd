import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { ColDef, SuppressKeyboardEventParams } from "ag-grid-community";
import { CustomCellRendererProps } from "ag-grid-react";
import { ReactNode } from "react";

import { convertSongMetadataTagToDisplayName } from "./convertAgGridTableSongs";

export function createAgGridColumnDefs(
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  isReorderingEnabled: boolean,
  isTouchDevice: boolean,
): ColDef[] {
  return columns.map((column, index) => ({
    field: convertSongMetadataTagToDisplayName(column.tag),
    rowDrag: index === 0 ? isReorderingEnabled : undefined,
    flex: column.widthFlex,
    resizable: true,
    sortable: isSortingEnabled,
    tooltipField: convertSongMetadataTagToDisplayName(column.tag),
    sort:
      !isSortingEnabled ||
      isReorderingEnabled ||
      column.sortOrder === undefined ||
      column.sortOrder < 0
        ? null
        : column.isSortDesc
          ? ("desc" as const)
          : ("asc" as const),
    sortIndex:
      !isSortingEnabled ||
      column.sortOrder === undefined ||
      column.sortOrder < 0
        ? null
        : column.sortOrder,
    cellDataType: false,
    checkboxSelection: isTouchDevice && index === 0 ? true : false,
    headerCheckboxSelection: isTouchDevice && index === 0 ? true : false,
    suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
      return params.event.key === " ";
    },
  }));
}

export function createAgGridColumnDefsCompact(
  isReorderingEnabled: boolean,
  isTouchDevice: boolean,
  CustomCell: (props: CustomCellRendererProps) => ReactNode,
): ColDef[] {
  return [
    {
      field: "Songs",
      rowDrag: isReorderingEnabled,
      flex: 1,
      resizable: false,
      sortable: false,
      checkboxSelection: isTouchDevice,
      headerCheckboxSelection: isTouchDevice,
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
        return params.event.key === " ";
      },
      cellRenderer: CustomCell,
    },
  ];
}
