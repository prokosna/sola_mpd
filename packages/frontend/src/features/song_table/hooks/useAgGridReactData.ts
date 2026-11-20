import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type {
	SelectionColumnDef,
	SuppressKeyboardEventParams,
} from "ag-grid-community";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { localeCollatorAtom } from "../../settings";
import { CustomCellCompact } from "../components/CustomCellCompact";
import {
	convertSongForGridRowValueCompact,
	convertSongMetadataForGridRowValue,
	convertSongMetadataTagToDisplayName,
	SONG_METADATA_FORMATTERS,
} from "../functions/songTableConversion";
import { getSongTableKey } from "../functions/songTableKey";
import { sortSongsByColumns } from "../functions/songTableSorting";
import {
	SONGS_TAG_COMPACT,
	type SongTableColumnDefinition,
	type SongTableColumnView,
	type SongTableKeyType,
	type SongTableRowData,
} from "../types/songTableTypes";

export function useAgGridReactData(
	songs: Song[],
	keyType: SongTableKeyType,
	columns: SongTableColumnView[],
	isSortingEnabled: boolean,
	isReorderingEnabled: boolean,
	isCompact: boolean,
): {
	rowData: SongTableRowData[];
	columnDefs: SongTableColumnDefinition[];
	selectionColumnDef: SelectionColumnDef;
} {
	const localeCollator = useAtomValue(localeCollatorAtom);

	const columnTagsKey = columns.map((c) => c.tag).join(",");
	// biome-ignore lint/correctness/useExhaustiveDependencies: Keyed by tag list so width/sort changes don't rebuild all rows.
	const columnTags = useMemo(() => columns.map((c) => c.tag), [columnTagsKey]);

	const compactRowData = useMemo(() => {
		if (!isCompact) {
			return undefined;
		}
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
	}, [isCompact, isSortingEnabled, songs, columns, keyType, localeCollator]);

	const fullRowData = useMemo(() => {
		if (isCompact) {
			return undefined;
		}
		return songs.map((song) => {
			const row: SongTableRowData = {};
			row.key = getSongTableKey(song, keyType);
			for (const tag of columnTags) {
				const [displayTag, value] = convertSongMetadataForGridRowValue(
					tag,
					song.metadata[tag],
				);
				row[displayTag] = value;
			}
			return row;
		});
	}, [isCompact, songs, columnTags, keyType]);

	const rowData = (isCompact ? compactRowData : fullRowData) ?? [];

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
			tooltip: true,
			valueFormatter: SONG_METADATA_FORMATTERS[column.tag],
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
