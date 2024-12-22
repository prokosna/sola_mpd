import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { AgGridEvent } from "ag-grid-community";
import { useCallback } from "react";

import {
  convertAgGridColumnsToSongTableColumns,
  copySortingAttributesToNewColumns,
} from "../utils/columnUtils";

/**
 * Uses a callback function on columns updated.
 * @param currentColumns Current columns.
 * @param isSortingEnabled True if sorting is enabled.
 * @param updateColumns Function to update columns.
 * @returns Callback function.
 */
export function useOnColumnsUpdated(
  currentColumns: SongTableColumn[],
  isSortingEnabled: boolean,
  updateColumns: (columns: SongTableColumn[]) => Promise<void>,
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
      updateColumns(newColumns);
    },
    [currentColumns, isSortingEnabled, updateColumns],
  );
}
