import { CircularProgress } from "@chakra-ui/react";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type { GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useRef } from "react";

import { useAgGridTheme } from "../../../lib/agGrid/hooks/useAgGridTheme";
import { ContextMenu, type ContextMenuSection } from "../../context_menu";
import { useIsCompactMode, useIsTouchDevice } from "../../user_device";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useHandleColumnsUpdated } from "../hooks/useHandleColumnsUpdated";
import { useHandleFirstDataRendered } from "../hooks/useHandleFirstDataRendered";
import { useHandleRowClick } from "../hooks/useHandleRowClick";
import { useHandleRowDataUpdated } from "../hooks/useHandleRowDataUpdated";
import { useHandleRowDoubleClick } from "../hooks/useHandleRowDoubleClick";
import { useHandleRowDragEnded } from "../hooks/useHandleRowDragEnded";
import { useHandleSelectionChange } from "../hooks/useHandleSelectionChange";
import { useKeyboardShortcutSelectAll } from "../hooks/useKeyboardShortcutSelectAll";
import { useOpenContextMenu } from "../hooks/useOpenContextMenu";
import { useRowClassRules } from "../hooks/useRowClassRules";
import { useSongsMap } from "../hooks/useSongsMap";
import { useSongsWithIndex } from "../hooks/useSongsWithIndex";
import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
	SongTableRowData,
} from "../types/songTableTypes";

export type SongTableProps = {
	id: string;
	songTableKeyType: SongTableKeyType;
	songs: Song[];
	columns: SongTableColumn[];
	isSortingEnabled: boolean;
	isReorderingEnabled: boolean;
	isGlobalFilterEnabled: boolean;
	contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[];
	isLoading: boolean;
	scrollToPlayingSong?: boolean;
	onSongsReordered: (orderedSongs: Song[]) => Promise<void>;
	onColumnsUpdated: (updatedColumns: SongTableColumn[]) => Promise<void>;
	onSongsSelected: (selectedSongs: Song[]) => Promise<void>;
	onSongDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>;
	onLoadingCompleted: () => Promise<void>;
};

/**
 * AG Grid-based song table with extensive functionality.
 *
 * Provides sorting, filtering, reordering, and context menu support.
 * Adapts to compact/touch modes and handles keyboard shortcuts.
 * Manages song selection and custom column configurations.
 *
 * @param props.id Table identifier
 * @param props.songTableKeyType Key type for row identification
 * @param props.songs Song data to display
 * @param props.columns Column configuration
 * @param props.isSortingEnabled Enable sorting
 * @param props.isReorderingEnabled Enable row reordering
 * @param props.isGlobalFilterEnabled Enable global filter
 * @param props.contextMenuSections Context menu configuration
 * @param props.isLoading Loading state
 * @param props.scrollToPlayingSong Scroll to playing song
 * @param props.onSongsReordered Reorder callback
 * @param props.onColumnsUpdated Column update callback
 * @param props.onSongsSelected Selection callback
 * @param props.onSongDoubleClick Double click callback
 * @param props.onLoadingCompleted Loading complete callback
 */
export function SongTable(props: SongTableProps): JSX.Element {
	const isCompact = useIsCompactMode();
	const isTouchDevice = useIsTouchDevice();

	const ref = useRef(null);
	const gridRef = useRef<AgGridReact>(null);

	// Songs
	const songsWithIndex = useSongsWithIndex(props.songs);
	const songsMap = useSongsMap(songsWithIndex, props.songTableKeyType);

	// Context menu
	const openContextMenu = useOpenContextMenu(
		props.id,
		props.songTableKeyType,
		songsMap,
		props.columns,
		props.isSortingEnabled,
	);

	// Keyboard shortcut
	useKeyboardShortcutSelectAll(ref, gridRef, songsMap, props.onSongsSelected);

	// AgGridReact format
	const { rowData, columnDefs, selectionColumnDef } = useAgGridReactData(
		songsWithIndex,
		props.songTableKeyType,
		props.columns,
		props.isSortingEnabled,
		props.isReorderingEnabled,
		isCompact,
	);

	// Use bold for the playing song.
	const rowClassRules = useRowClassRules(props.songTableKeyType, songsMap);

	// Get Row ID callback function
	const getRowId = useCallback((params: GetRowIdParams<SongTableRowData>) => {
		return String(params.data.key);
	}, []);

	// Handlers
	const handleRowClick = useHandleRowClick();
	const handleColumnsUpdated = useHandleColumnsUpdated(
		props.columns,
		props.isSortingEnabled,
		props.onColumnsUpdated,
	);
	const handleRowDragEnded = useHandleRowDragEnded(
		songsMap,
		props.onSongsReordered,
	);
	const handleSelectionChange = useHandleSelectionChange(
		songsMap,
		props.onSongsSelected,
	);
	const handleRowDoubleClick = useHandleRowDoubleClick(
		songsMap,
		props.onSongDoubleClick,
	);
	const handleRowDataUpdated = useHandleRowDataUpdated(
		props.onLoadingCompleted,
	);
	const handleFirstDataRendered = useHandleFirstDataRendered(
		props.songTableKeyType,
		props.scrollToPlayingSong ?? false,
	);

	// Color mode
	const theme = useAgGridTheme();

	return (
		<>
			<div
				ref={ref}
				style={{ height: "100%", width: "100%", position: "relative" }}
			>
				<AgGridReact
					ref={gridRef}
					theme={theme}
					rowData={rowData}
					columnDefs={columnDefs}
					onSortChanged={!isCompact ? handleColumnsUpdated : undefined}
					onColumnMoved={!isCompact ? handleColumnsUpdated : undefined}
					onRowDragEnd={handleRowDragEnded}
					onRowDoubleClicked={handleRowDoubleClick}
					onColumnResized={!isCompact ? handleColumnsUpdated : undefined}
					onCellContextMenu={openContextMenu}
					onSelectionChanged={handleSelectionChange}
					onRowDataUpdated={handleRowDataUpdated}
					onRowClicked={handleRowClick}
					animateRows={true}
					colResizeDefault={"shift"}
					rowSelection={{
						mode: "multiRow",
						checkboxes: isTouchDevice,
						headerCheckbox: isTouchDevice,
						enableClickSelection: true,
						enableSelectionWithoutKeys: false,
					}}
					rowDragManaged={true}
					rowDragMultiRow={true}
					preventDefaultOnContextMenu={true}
					rowClassRules={rowClassRules}
					getRowId={getRowId}
					rowHeight={isCompact ? 60 : 30}
					alwaysMultiSort={!!isTouchDevice}
					selectionColumnDef={selectionColumnDef}
					onFirstDataRendered={handleFirstDataRendered}
				/>
				{props.isLoading && (
					<CircularProgress
						top={"50%"}
						left={"50%"}
						transform={"translate(-50%, -50%) scale(1.5)"}
						position={"absolute"}
						isIndeterminate
						color="brand.500"
					/>
				)}
			</div>
			<ContextMenu id={props.id} sections={props.contextMenuSections} />
		</>
	);
}
