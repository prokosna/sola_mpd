import { CircularProgress, useColorMode } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useRef } from "react";

import { ContextMenu, ContextMenuSection } from "../../context_menu";
import { useIsCompactMode, useIsTouchDevice } from "../../user_device";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useGetBoldClassForPlayingSong } from "../hooks/useGetBoldClassForPlayingSong";
import { useKeyboardShortcutSelectAll } from "../hooks/useKeyboardShortcutSelectAll";
import { useOnColumnsUpdated } from "../hooks/useOnColumnsUpdated";
import { useOnContextMenuOpened } from "../hooks/useOnContextMenuOpened";
import { useOnRowDataUpdated } from "../hooks/useOnRowDataUpdated";
import { useOnRowDoubleClicked } from "../hooks/useOnRowDoubleClicked";
import { useOnRowDragEnded } from "../hooks/useOnRowDragEnded";
import { useOnSelectionChanged } from "../hooks/useOnSelectionChanged";
import { useSongsMap } from "../hooks/useSongsMap";
import { useSongsWithIndex } from "../hooks/useSongsWithIndex";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
  SongTableRowData,
} from "../types/songTableTypes";

import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "../styles/agGrid.css";

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
  reorderSongs: (orderedSongs: Song[]) => Promise<void>;
  updateColumns: (updatedColumns: SongTableColumn[]) => Promise<void>;
  selectSongs: (selectedSongs: Song[]) => Promise<void>;
  doubleClickSong: (clickedSong: Song, songs: Song[]) => Promise<void>;
  completeLoading: () => Promise<void>;
};

export function SongTable(props: SongTableProps): JSX.Element {
  const isCompact = useIsCompactMode();
  const isTouchDevice = useIsTouchDevice();

  const ref = useRef(null);
  const gridRef = useRef<AgGridReact>(null);

  // Songs
  const songsWithIndex = useSongsWithIndex(props.songs);
  const songsMap = useSongsMap(songsWithIndex, props.songTableKeyType);

  // Context menu
  const onContextMenuOpened = useOnContextMenuOpened(
    props.id,
    props.songTableKeyType,
    songsMap,
    props.columns,
    props.isSortingEnabled,
  );

  // Keyboard shortcut
  useKeyboardShortcutSelectAll(ref, gridRef, songsMap, props.selectSongs);

  // AgGridReact format
  const { rowData, columnDefs } = useAgGridReactData(
    songsWithIndex,
    props.songTableKeyType,
    props.columns,
    props.isSortingEnabled,
    props.isReorderingEnabled,
    isCompact,
    isTouchDevice,
  );

  // Use bold for the playing song.
  const getBoldClassForPlayingSong = useGetBoldClassForPlayingSong(
    props.songTableKeyType,
    songsMap,
  );

  // Get Row ID callback function
  const getRowId = useCallback((params: GetRowIdParams<SongTableRowData>) => {
    return String(params.data.key);
  }, []);

  // Handlers
  const onSortChanged = useOnColumnsUpdated(
    props.columns,
    props.isSortingEnabled,
    props.updateColumns,
  );
  const onColumnsMoved = useOnColumnsUpdated(
    props.columns,
    props.isSortingEnabled,
    props.updateColumns,
  );
  const onRowDragEnded = useOnRowDragEnded(songsMap, props.reorderSongs);
  const onSelectionChanged = useOnSelectionChanged(songsMap, props.selectSongs);
  const onRowDoubleClicked = useOnRowDoubleClicked(
    songsMap,
    props.doubleClickSong,
  );
  const onColumnsResized = useOnColumnsUpdated(
    props.columns,
    props.isSortingEnabled,
    props.updateColumns,
  );
  const onRowDataUpdated = useOnRowDataUpdated(props.completeLoading);

  // Color mode
  const { colorMode } = useColorMode();

  return (
    <>
      <div
        ref={ref}
        className={
          colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
        }
        style={{ height: "100%", width: "100%", position: "relative" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onSortChanged={!isCompact ? onSortChanged : undefined}
          onColumnMoved={!isCompact ? onColumnsMoved : undefined}
          onRowDragEnd={onRowDragEnded}
          onRowDoubleClicked={onRowDoubleClicked}
          onColumnResized={!isCompact ? onColumnsResized : undefined}
          onCellContextMenu={onContextMenuOpened}
          onSelectionChanged={onSelectionChanged}
          onRowDataUpdated={onRowDataUpdated}
          animateRows={true}
          colResizeDefault={"shift"}
          rowSelection={"multiple"}
          rowDragManaged={true}
          rowDragMultiRow={true}
          preventDefaultOnContextMenu={true}
          rowClass={
            colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
          }
          getRowClass={getBoldClassForPlayingSong}
          getRowId={getRowId}
          rowHeight={isCompact ? 60 : 30}
          alwaysMultiSort={isTouchDevice ? true : false}
        ></AgGridReact>
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
      <ContextMenu
        id={props.id}
        sections={props.contextMenuSections}
      ></ContextMenu>
    </>
  );
}
