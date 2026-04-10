import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { SuppressKeyboardEventParams } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { JSX } from "react";

export enum SongTableKeyType {
	PATH = "PATH",
	INDEX_PATH = "INDEX_PATH",
	ID = "ID",
}

export type SongTableKey = string;

export const SONGS_TAG_COMPACT = "songs";

export type SongTableRowCompact = {
	firstLine: string;
	secondLine: string;
};

export type SongTableRowValue =
	| string
	| number
	| Date
	| SongTableRowCompact
	| undefined;

export type SongTableRowKeyValue = [string, SongTableRowValue];

export type SongTableRowData = {
	[tag: string]: SongTableRowValue;
};

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

export type SongsInTable = {
	clickedSong: Song | undefined;
	sortedSongs: Song[];
	selectedSortedSongs: Song[];
};

export type SongTableContextMenuItemParams = {
	columns: SongTableColumn[];
	clickedSong: Song;
	sortedSongs: Song[];
	selectedSortedSongs: Song[];
};
