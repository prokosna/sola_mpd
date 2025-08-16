import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type { SuppressKeyboardEventParams } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { JSX } from "react";

/**
 * Key type for song table row identification.
 *
 * Determines which song property is used as the unique key:
 * - PATH: Song file path
 * - INDEX_PATH: Combined song index and path
 * - ID: Song unique identifier
 */
export enum SongTableKeyType {
	PATH = "PATH",
	INDEX_PATH = "INDEX_PATH",
	ID = "ID",
}

/**
 * Song table row key type.
 *
 * String representation of the key based on SongTableKeyType.
 */
export type SongTableKey = string;

/**
 * Tag identifier for compact view mode column.
 *
 * Used to identify the special column that displays song
 * information in a compact two-line format.
 */
export const SONGS_TAG_COMPACT = "songs";

/**
 * Compact view mode row data structure.
 *
 * Represents song information in a two-line format for
 * space-efficient display in compact view mode.
 */
export type SongTableRowCompact = {
	firstLine: string;
	secondLine: string;
};

/**
 * Song table cell value type.
 *
 * Union of possible value types that can be displayed
 * in song table cells, including compact view format.
 */
export type SongTableRowValue =
	| string
	| number
	| Date
	| SongTableRowCompact
	| undefined;

/**
 * Song table cell key-value pair.
 *
 * Tuple representing a table cell's field name and
 * its corresponding value.
 */
export type SongTableRowKeyValue = [string, SongTableRowValue];

/**
 * Song table row data structure.
 *
 * Complete data structure for a song table row, including
 * key and all cell values mapped by field names.
 */
export type SongTableRowData = {
	[tag: string]: SongTableRowValue;
};

/**
 * AG Grid column configuration.
 *
 * Extended column definition for song table, including
 * drag-and-drop, sorting, and custom rendering options.
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
	suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean;
	cellRenderer?: (props: CustomCellRendererProps) => JSX.Element;
};

/**
 * Song list with selection state.
 *
 * Contains clicked song and current song list order,
 * including selected songs, for table operations.
 */
export type SongsInTable = {
	clickedSong: Song | undefined;
	sortedSongs: Song[];
	selectedSortedSongs: Song[];
};

/**
 * Context menu item configuration.
 *
 * Parameters passed to context menu items, providing
 * access to table state and selected songs.
 */
export type SongTableContextMenuItemParams = {
	columns: SongTableColumn[];
	clickedSong: Song;
	sortedSongs: Song[];
	selectedSortedSongs: Song[];
};
