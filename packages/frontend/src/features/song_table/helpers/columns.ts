import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { Column } from "ag-grid-community";

import { convertSongMetadataTagFromDisplayName } from "./table";

export function convertAgGridColumnsToSongTableColumns(
  agGridColumns: Column[],
) {
  return agGridColumns.map((col) => {
    const sortOrder = col.getSortIndex();
    const isSortDesc = (() => {
      switch (col.getSort()) {
        case "asc":
          return false;
        case "desc":
          return true;
        default:
          return false;
      }
    })();
    const flex = col.getActualWidth();
    const column = new SongTableColumn({
      tag: convertSongMetadataTagFromDisplayName(col.getColId()),
      sortOrder: sortOrder != null ? sortOrder : undefined,
      isSortDesc,
      widthFlex: flex,
    });
    return column;
  });
}

export function copySortingAttributesToNewColumns(
  newColumns: SongTableColumn[],
  baseColumns: SongTableColumn[],
): SongTableColumn[] {
  return newColumns.map((column) => {
    for (const baseColumn of baseColumns) {
      if (column.tag === baseColumn.tag) {
        const newColumn = column.clone();
        newColumn.isSortDesc = baseColumn.isSortDesc;
        newColumn.sortOrder = baseColumn.sortOrder;
        return newColumn;
      }
    }
    return column;
  });
}

export function normalizeSongTableColumns(columns: SongTableColumn[]) {
  const sorted = Array.from(
    columns.filter(
      (column) => column.sortOrder !== undefined && column.sortOrder >= 0,
    ),
  ).sort((a, b) => a.sortOrder! - b.sortOrder!);
  for (const column of columns) {
    if (column.sortOrder !== undefined && column.sortOrder >= 0) {
      column.sortOrder = sorted.findIndex((col) => col.tag === column.tag);
    }
  }
  return columns;
}
