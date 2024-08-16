import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { CustomCellCompact } from "../components/CustomCellCompact";
import { SongTableKeyType } from "../types/songTableTypes";
import {
  createAgGridColumnDefs,
  createAgGridColumnDefsCompact,
} from "../workflows/createAgGridColumnDefs";
import {
  createAgGridRowData,
  createAgGridRowDataCompact,
} from "../workflows/createAgGridRowData";

export function useAgGridReactData(
  songs: Song[],
  keyType: SongTableKeyType,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  isReorderingEnabled: boolean,
  isCompact: boolean,
  isTouchDevice: boolean,
) {
  const rowData = isCompact
    ? createAgGridRowDataCompact(songs, keyType, columns, isSortingEnabled)
    : createAgGridRowData(songs, keyType, columns);

  const columnDefs = isCompact
    ? createAgGridColumnDefsCompact(
        isReorderingEnabled,
        isTouchDevice,
        CustomCellCompact,
      )
    : createAgGridColumnDefs(
        columns,
        isSortingEnabled,
        isReorderingEnabled,
        isTouchDevice,
      );

  return {
    rowData,
    columnDefs,
  };
}
