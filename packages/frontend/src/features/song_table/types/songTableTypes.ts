import type {
	Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
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
	columns: SongTableColumnView[];
	clickedSong: Song;
	sortedSongs: Song[];
	selectedSortedSongs: Song[];
};

/** What a song table renders: a composed view, not a persisted document. */
export type SongTableColumnView = {
	tag: Song_MetadataTag;
	widthFlex: number;
	sortOrder?: number;
	isSortDesc: boolean;
};

export type SongTableDeviceLayoutSort = {
	tag: Song_MetadataTag;
	isDesc: boolean;
};

/**
 * `Partial<Record<...>>` keeps the enum in the type while JS stores the key
 * as a string; enumerating via `Object.keys` needs `Number(key)` plus an enum
 * membership check to convert back.
 */
export type SongTableDeviceLayout = {
	widthFlexByTag: Partial<Record<Song_MetadataTag, number>>;
	sort: SongTableDeviceLayoutSort[];
	/**
	 * Keyed by saved search name, since that is how a saved search is
	 * identified elsewhere; renaming a search orphans its entry here.
	 * Optional so a layout stored before this field existed loads as-is.
	 */
	widthFlexByTagBySearchName?: Partial<
		Record<string, Partial<Record<Song_MetadataTag, number>>>
	>;
};
