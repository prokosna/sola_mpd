import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SuppressKeyboardEventParams } from "ag-grid-community";
import { CustomCellRendererProps } from "ag-grid-react";

/**
 * Which value is used for the row key in a song table.
 * PATH: song path field.
 * INDEX_PATH: song index field + song path field.
 * ID: song ID field.
 */
export enum SongTableKeyType {
  PATH = "PATH",
  INDEX_PATH = "INDEX_PATH",
  ID = "ID",
}

/**
 * Type of a key field of a table. An actual value depending on the key type.
 */
export type SongTableKey = string;

/**
 * Column tag for compact mode.
 */
export const SONGS_TAG_COMPACT = "songs";

/**
 * Row value type for compact mode.
 */
export type SongTableRowCompact = {
  firstLine: string;
  secondLine: string;
};

/**
 * Row value type.
 */
export type SongTableRowValue =
  | string
  | number
  | Date
  | SongTableRowCompact
  | undefined;

/**
 * Row key-value pair.
 */
export type SongTableRowKeyValue = [string, SongTableRowValue];

/**
 * Row data type.
 */
export type SongTableRowData = {
  [tag: string]: SongTableRowValue;
};

/**
 * Column definition type.
 */
export type SongTableColumnDefinition = {
  field: string;
  rowDrag?: boolean;
  flex: number;
  resizable: boolean;
  sortable: boolean;
  tooltipField?: string;
  sort?: "asc" | "desc" | null;
  sortIndex?: number;
  cellDataType?: boolean;
  checkboxSelection: boolean;
  headerCheckboxSelection: boolean;
  suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean;
  cellRenderer?: (props: CustomCellRendererProps) => JSX.Element;
};

/**
 * Utility type to get songs in a table with its index (position)
 */
export type SongsInTable = {
  clickedSong: Song | undefined;
  sortedSongs: Song[];
  selectedSortedSongs: Song[];
};

/**
 * Parameters for a context menu item.
 */
export type SongTableContextMenuItemParams = {
  columns: SongTableColumn[];
  clickedSong: Song;
  sortedSongs: Song[];
  selectedSortedSongs: Song[];
};
