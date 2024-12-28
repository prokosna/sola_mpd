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
import { useHandleColumnsUpdated } from "../hooks/useHandleColumnsUpdated";
import { useHandleRowDataUpdated } from "../hooks/useHandleRowDataUpdated";
import { useHandleRowDoubleClick } from "../hooks/useHandleRowDoubleClick";
import { useHandleRowDragEnded } from "../hooks/useHandleRowDragEnded";
import { useHandleSelectionChange } from "../hooks/useHandleSelectionChange";
import { useKeyboardShortcutSelectAll } from "../hooks/useKeyboardShortcutSelectAll";
import { useOpenContextMenu } from "../hooks/useOpenContextMenu";
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
  onSongsReordered: (orderedSongs: Song[]) => Promise<void>;
  onColumnsUpdated: (updatedColumns: SongTableColumn[]) => Promise<void>;
  onSongsSelected: (selectedSongs: Song[]) => Promise<void>;
  onSongDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>;
  onLoadingCompleted: () => Promise<void>;
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
          onSortChanged={!isCompact ? handleColumnsUpdated : undefined}
          onColumnMoved={!isCompact ? handleColumnsUpdated : undefined}
          onRowDragEnd={handleRowDragEnded}
          onRowDoubleClicked={handleRowDoubleClick}
          onColumnResized={!isCompact ? handleColumnsUpdated : undefined}
          onCellContextMenu={openContextMenu}
          onSelectionChanged={handleSelectionChange}
          onRowDataUpdated={handleRowDataUpdated}
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
