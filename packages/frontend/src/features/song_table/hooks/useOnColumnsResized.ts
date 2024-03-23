import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { ColumnResizedEvent } from "ag-grid-community";
import { useCallback } from "react";

import { convertAgGridColumnsToSongTableColumns } from "../helpers/columns";

export function useOnColumnsResized(
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  onUpdateColumns: (columns: SongTableColumn[]) => Promise<void>,
) {
  return useCallback(
    (event: ColumnResizedEvent) => {
      if (!event.finished) {
        return;
      }
      const { api } = event;
      const currentColumns = convertAgGridColumnsToSongTableColumns(
        api.getAllGridColumns(),
      );
      if (!isSortingEnabled) {
        for (const currentColumn of currentColumns) {
          const index = columns.findIndex(
            (column) => column.tag === currentColumn.tag,
          );
          if (index >= 0) {
            currentColumn.sortOrder = columns[index].sortOrder;
            currentColumn.isSortDesc = columns[index].isSortDesc;
          }
        }
      }
      onUpdateColumns(currentColumns);
    },
    [columns, isSortingEnabled, onUpdateColumns],
  );
}
