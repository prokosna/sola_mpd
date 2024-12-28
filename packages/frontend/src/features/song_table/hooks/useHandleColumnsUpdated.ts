import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { AgGridEvent } from "ag-grid-community";
import { useCallback } from "react";

import {
  convertAgGridColumnsToSongTableColumns,
  copySortingAttributesToNewColumns,
} from "../utils/songTableColumnUtils";

/**
 * Uses a callback function on columns updated.
 * @param currentColumns Current columns.
 * @param isSortingEnabled True if sorting is enabled.
 * @param onColumnsUpdated Function to update columns.
 * @returns Callback function.
 */
export function useHandleColumnsUpdated(
  currentColumns: SongTableColumn[],
  isSortingEnabled: boolean,
  onColumnsUpdated: (columns: SongTableColumn[]) => Promise<void>,
): (event: AgGridEvent) => void {
  return useCallback(
    (event: AgGridEvent) => {
      const { api } = event;
      const updatedColumns = convertAgGridColumnsToSongTableColumns(
        api.getAllGridColumns(),
      );
      const newColumns = isSortingEnabled
        ? updatedColumns
        : copySortingAttributesToNewColumns(updatedColumns, currentColumns);
      onColumnsUpdated(newColumns);
    },
    [currentColumns, isSortingEnabled, onColumnsUpdated],
  );
}
