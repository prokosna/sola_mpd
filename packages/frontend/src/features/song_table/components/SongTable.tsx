import { CircularProgress, useColorMode } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useRef } from "react";

import { ContextMenu, ContextMenuSection } from "../../context_menu";
import { useUserDeviceType } from "../../user_device";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useGetBoldClassForPlayingSong } from "../hooks/useGetBoldClassForPlayingSong";
import { useKeyboardShortcutSelectAll } from "../hooks/useKeyboardShortcutSelectAll";
import { useOnColumnsMoved } from "../hooks/useOnColumnsMoved";
import { useOnColumnsResized } from "../hooks/useOnColumnsResized";
import { useOnOpenContextMenu } from "../hooks/useOnOpenContextMenu";
import { useOnRowDataUpdated } from "../hooks/useOnRowDataUpdated";
import { useOnRowDoubleClicked } from "../hooks/useOnRowDoubleClicked";
import { useOnRowDragEnd } from "../hooks/useOnRowDragEnd";
import { useOnSelectionChanged } from "../hooks/useOnSelectionChanged";
import { useOnSortChanged } from "../hooks/useOnSortChanged";
import { useSongsMap } from "../hooks/useSongsMap";
import { useSongsWithIndex } from "../hooks/useSongsWithIndex";
import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
  SongTableRowDataType,
} from "../types/songTable";

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
  onReorderSongs: (orderedSongs: Song[]) => Promise<void>;
  onUpdateColumns: (updatedColumns: SongTableColumn[]) => Promise<void>;
  onSelectSongs: (selectedSongs: Song[]) => Promise<void>;
  onDoubleClick: (clickedSong: Song, songs: Song[]) => Promise<void>;
  onCompleteLoading: () => Promise<void>;
};

export function SongTable(props: SongTableProps) {
  const userDeviceType = useUserDeviceType();
  const isCompact = userDeviceType === "middle" || userDeviceType === "small";

  const ref = useRef(null);
  const gridRef = useRef<AgGridReact>(null);

  // Songs
  const songsWithIndex = useSongsWithIndex(props.songs);
  const songsMap = useSongsMap(songsWithIndex, props.songTableKeyType);

  // Context menu
  const onOpenContextMenu = useOnOpenContextMenu(
    props.id,
    props.songTableKeyType,
    songsMap,
    props.columns,
    props.isSortingEnabled,
  );

  // Keyboard shortcut
  useKeyboardShortcutSelectAll(ref, gridRef, songsMap, props.onSelectSongs);

  // AgGridReact format
  const { rowData, columnDefs } = useAgGridReactData(
    songsWithIndex,
    props.songTableKeyType,
    props.columns,
    props.isSortingEnabled,
    props.isReorderingEnabled,
    isCompact,
  );

  // Use bold for the playing song
  const getBoldClassForPlayingSong = useGetBoldClassForPlayingSong(
    props.songTableKeyType,
    songsMap,
  );

  // Get Row ID
  const getRowId = useCallback(
    (params: GetRowIdParams<SongTableRowDataType>) => {
      return String(params.data.key);
    },
    [],
  );

  // Handlers
  const onSortChanged = useOnSortChanged(
    props.columns,
    props.isSortingEnabled,
    props.onUpdateColumns,
  );
  const onColumnsMoved = useOnColumnsMoved(
    props.columns,
    props.isSortingEnabled,
    props.onUpdateColumns,
  );
  const onRowDragEnd = useOnRowDragEnd(songsMap, props.onReorderSongs);
  const onSelectionChanged = useOnSelectionChanged(
    songsMap,
    props.onSelectSongs,
  );
  const onRowDoubleClicked = useOnRowDoubleClicked(
    songsMap,
    props.onDoubleClick,
  );
  const onColumnsResized = useOnColumnsResized(
    props.columns,
    props.isSortingEnabled,
    props.onUpdateColumns,
  );
  const onRowDataUpdated = useOnRowDataUpdated(props.onCompleteLoading);

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
