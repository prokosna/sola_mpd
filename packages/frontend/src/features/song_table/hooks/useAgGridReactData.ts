import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useMemo } from "react";

import { useIsTouchDevice } from "../../user_device";
import {
  convertSongMetadataForGridRowValue,
  convertSongMetadataTagToDisplayName,
  getTableKeyOfSong,
} from "../helpers/table";
import { SongTableKeyType, SongTableRowDataType } from "../types/songTable";

export function useAgGridReactData(
  songs: Song[],
  keyType: SongTableKeyType,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  isReorderingEnabled: boolean,
) {
  const isTouchDevice = useIsTouchDevice();

  // Convert Song to AdGrid item format (Column: Value)
  const rowData = useMemo(() => {
    return songs.map((song) => {
      const row: SongTableRowDataType = {};
      row.key = getTableKeyOfSong(song, keyType);
      for (const column of columns) {
        const [tag, value] = convertSongMetadataForGridRowValue(
          column.tag,
          song.metadata[column.tag],
        );
        row[tag] = value;
      }
      return row;
    });
  }, [songs, keyType, columns]);

  // Convert columns to AgGrid column definitions
  const columnDefs = useMemo(() => {
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
    }));
  }, [columns, isReorderingEnabled, isSortingEnabled, isTouchDevice]);

  return {
    rowData,
    columnDefs,
  };
}
