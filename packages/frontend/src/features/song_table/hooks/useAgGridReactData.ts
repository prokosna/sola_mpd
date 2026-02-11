import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type {
	SelectionColumnDef,
	SuppressKeyboardEventParams,
} from "ag-grid-community";
import { useMemo } from "react";

import { useLocaleCollatorState } from "../../settings";
import { CustomCellCompact } from "../components/CustomCellCompact";
import {
	SONGS_TAG_COMPACT,
	type SongTableColumnDefinition,
	type SongTableKeyType,
	type SongTableRowData,
} from "../types/songTableTypes";
import {
	convertSongForGridRowValueCompact,
	convertSongMetadataForGridRowValue,
	convertSongMetadataTagToDisplayName,
	getSongTableKey,
	sortSongsByColumns,
} from "../utils/songTableTableUtils";

/**
 * Prepares data for AG Grid song table display.
 *
 * Transforms song data into AG Grid compatible format, handling
 * both compact and standard view modes. Manages sorting,
 * reordering, and touch device adaptations.
 *
 * @param songs Song list
 * @param keyType Row key type
 * @param columns Column config
 * @param isSortingEnabled Enable sorting
 * @param isReorderingEnabled Enable reordering
 * @param isCompact Compact mode flag
 * @param isTouchDevice Touch device flag
 * @returns Row data and column definitions
 */
export function useAgGridReactData(
	songs: Song[],
	keyType: SongTableKeyType,
	columns: SongTableColumn[],
	isSortingEnabled: boolean,
	isReorderingEnabled: boolean,
	isCompact: boolean,
): {
	rowData: SongTableRowData[];
	columnDefs: SongTableColumnDefinition[];
	selectionColumnDef: SelectionColumnDef;
} {
	const localeCollator = useLocaleCollatorState();

	// Convert Song to AdGrid item format (Column -> Value).
	const rowData = useMemo(() => {
		if (isCompact) {
			return (
				isSortingEnabled
					? sortSongsByColumns(songs, columns, localeCollator)
					: songs
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
	}, [isCompact, isSortingEnabled, songs, columns, keyType, localeCollator]);

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
			suppressKeyboardEvent: (params: SuppressKeyboardEventParams): boolean => {
				return params.event.key === " ";
			},
		}));
	}, [columns, isCompact, isReorderingEnabled, isSortingEnabled]);

	// Selection column definision
	const selectionColumnDef: SelectionColumnDef = useMemo(() => {
		return {
			sortable: false,
			resizable: false,
			suppressHeaderMenuButton: true,
			width: 38,
			maxWidth: 38,
			cellStyle: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 0,
				margin: 0,
			},
		};
	}, []);

	return {
		rowData,
		columnDefs,
		selectionColumnDef,
	};
}
