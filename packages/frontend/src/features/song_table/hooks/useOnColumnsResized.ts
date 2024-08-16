import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { ColumnResizedEvent } from "ag-grid-community";

import { convertAgGridColumnsToSongTableColumns } from "../workflows/convertAgGridTableColumns";

export function useOnColumnsResized(
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  updateColumnsAction: (columns: SongTableColumn[]) => Promise<void>,
) {
  return (event: ColumnResizedEvent) => {
    if (!event.finished) {
      return;
    }
    const { api } = event;
    const currentColumns = convertAgGridColumnsToSongTableColumns(
      api.getAllGridColumns(),
      columns,
      isSortingEnabled,
    );
    updateColumnsAction(currentColumns);
  };
}
