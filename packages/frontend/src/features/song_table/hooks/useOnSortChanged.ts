import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SortChangedEvent } from "ag-grid-community";

import { convertAgGridColumnsToSongTableColumns } from "../workflows/convertAgGridTableColumns";

export function useOnSortChanged(
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  updateColumnsAction: (columns: SongTableColumn[]) => Promise<void>,
) {
  return (event: SortChangedEvent) => {
    const { api } = event;
    const currentColumns = convertAgGridColumnsToSongTableColumns(
      api.getAllGridColumns(),
      columns,
      isSortingEnabled,
    );
    updateColumnsAction(currentColumns);
  };
}
