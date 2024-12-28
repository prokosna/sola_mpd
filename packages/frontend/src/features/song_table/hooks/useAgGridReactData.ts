import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SuppressKeyboardEventParams } from "ag-grid-community";
import { useMemo } from "react";

import { CustomCellCompact } from "../components/CustomCellCompact";
import {
  SONGS_TAG_COMPACT,
  SongTableColumnDefinition,
  SongTableKeyType,
  SongTableRowData,
} from "../types/songTableTypes";
import {
  convertSongForGridRowValueCompact,
  convertSongMetadataForGridRowValue,
  convertSongMetadataTagToDisplayName,
  getSongTableKey,
  sortSongsByColumns,
} from "../utils/songTableTableUtils";

/**
 * Uses ag-grid-react data for a table.
 * @param songs Songs to be rendered.
 * @param keyType Type of a key field of a table.
 * @param columns Current columns.
 * @param isSortingEnabled True if sorting is enabled.
 * @param isReorderingEnabled True if reordering is enabled.
 * @param isCompact True if the compact mode is enabled.
 * @param isTouchDevice True if a user uses a touch device.
 * @returns Data to be used for an ag-grid-react table.
 */
export function useAgGridReactData(
  songs: Song[],
  keyType: SongTableKeyType,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
  isReorderingEnabled: boolean,
  isCompact: boolean,
  isTouchDevice: boolean,
): { rowData: SongTableRowData[]; columnDefs: SongTableColumnDefinition[] } {
  // Convert Song to AdGrid item format (Column -> Value).
  const rowData = useMemo(() => {
    if (isCompact) {
      return (
        isSortingEnabled ? sortSongsByColumns(songs, columns) : songs
      ).map((song) => {
        const row: SongTableRowData = {};
        row.key = getSongTableKey(song, keyType);
        row[SONGS_TAG_COMPACT] = convertSongForGridRowValueCompact(song);
        return row;
      });
    }
    return songs.map((song) => {
      const row: SongTableRowData = {};
      row.key = getSongTableKey(song, keyType);
      for (const column of columns) {
        const [tag, value] = convertSongMetadataForGridRowValue(
          column.tag,
          song.metadata[column.tag],
        );
        row[tag] = value;
      }
      return row;
    });
  }, [isCompact, isSortingEnabled, songs, columns, keyType]);

  // Convert columns to AgGrid column definitions
  const columnDefs = useMemo(() => {
    if (isCompact) {
      return [
        {
          field: "Songs",
          rowDrag: isReorderingEnabled,
          flex: 1,
          resizable: false,
          sortable: false,
          checkboxSelection: isTouchDevice,
          headerCheckboxSelection: isTouchDevice,
          suppressKeyboardEvent: (
            params: SuppressKeyboardEventParams,
          ): boolean => {
            return params.event.key === " ";
          },
          cellRenderer: CustomCellCompact,
        },
      ];
    }
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
          ? undefined
          : column.sortOrder,
      cellDataType: false,
      checkboxSelection: isTouchDevice && index === 0 ? true : false,
      headerCheckboxSelection: isTouchDevice && index === 0 ? true : false,
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams): boolean => {
        return params.event.key === " ";
      },
    }));
  }, [
    columns,
    isCompact,
    isReorderingEnabled,
    isSortingEnabled,
    isTouchDevice,
  ]);

  return {
    rowData,
    columnDefs,
  };
}
