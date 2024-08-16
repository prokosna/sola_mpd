import { CircularProgress, useColorMode } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useRef } from "react";

import { ContextMenu, ContextMenuSection } from "../../context_menu";
import { useCurrentSongState } from "../../player";
import { useIsCompactMode, useIsTouchDevice } from "../../user_device";
import { useOpenContextMenuAction } from "../actions/useOpenContextMenuAction";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useGetBoldClassForPlayingSong } from "../hooks/useGetBoldClassForPlayingSong";
import { useOnColumnsMoved } from "../hooks/useOnColumnsMoved";
import { useOnColumnsResized } from "../hooks/useOnColumnsResized";
import { useOnRowDataUpdated } from "../hooks/useOnRowDataUpdated";
import { useOnRowDoubleClicked } from "../hooks/useOnRowDoubleClicked";
import { useOnRowDragEnd } from "../hooks/useOnRowDragEnd";
import { useOnSelectionChanged } from "../hooks/useOnSelectionChanged";
import { useOnSortChanged } from "../hooks/useOnSortChanged";
import { useSelectAllByControlAEffect } from "../hooks/useSelectAllByControlAEffect";
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
  reorderSongsAction: (orderedSongs: Song[]) => Promise<void>;
  updateColumnsAction: (updatedColumns: SongTableColumn[]) => Promise<void>;
  selectSongsAction: (selectedSongs: Song[]) => Promise<void>;
  addAndPlaySongAction: (clickedSong: Song, songs: Song[]) => Promise<void>;
  completeLoadingAction: () => Promise<void>;
};

export function SongTable(props: SongTableProps) {
  const isCompact = useIsCompactMode();
  const isTouchDevice = useIsTouchDevice();

  const parentDivRef = useRef(null);
  const gridRef = useRef<AgGridReact>(null);

  // Songs
  const currentSong = useCurrentSongState();
  const songsWithIndex = useSongsWithIndex(props.songs);
  const songsMap = useSongsMap(songsWithIndex, props.songTableKeyType);

  // Context menu
  const onOpenContextMenu = useOpenContextMenuAction(
    props.id,
    props.songTableKeyType,
    songsMap,
    props.columns,
    props.isSortingEnabled,
  );

  // Keyboard shortcut
  useSelectAllByControlAEffect(
    parentDivRef,
    gridRef,
    songsMap,
    props.selectSongsAction,
  );

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

  // Use bold for the playing song
  const getBoldClassForPlayingSong = useGetBoldClassForPlayingSong(
    currentSong,
    props.songTableKeyType,
    songsMap,
  );

  // Get Row ID
  const getRowId = useCallback((params: GetRowIdParams<SongTableRowData>) => {
    return String(params.data.key);
  }, []);

  // Handlers
  const onSortChanged = useOnSortChanged(
    props.columns,
    props.isSortingEnabled,
    props.updateColumnsAction,
  );
  const onColumnsMoved = useOnColumnsMoved(
    props.columns,
    props.isSortingEnabled,
    props.updateColumnsAction,
  );
  const onRowDragEnd = useOnRowDragEnd(songsMap, props.reorderSongsAction);
  const onSelectionChanged = useOnSelectionChanged(
    songsMap,
    props.selectSongsAction,
  );
  const onRowDoubleClicked = useOnRowDoubleClicked(
    songsMap,
    props.addAndPlaySongAction,
  );
  const onColumnsResized = useOnColumnsResized(
    props.columns,
    props.isSortingEnabled,
    props.updateColumnsAction,
  );
  const onRowDataUpdated = useOnRowDataUpdated(props.completeLoadingAction);

  // Color mode
  const { colorMode } = useColorMode();

  return (
    <>
      <div
        ref={parentDivRef}
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
          onRowDragEnd={onRowDragEnd}
          onRowDoubleClicked={onRowDoubleClicked}
          onColumnResized={!isCompact ? onColumnsResized : undefined}
          onCellContextMenu={onOpenContextMenu}
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
