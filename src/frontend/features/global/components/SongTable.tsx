"use client";
import { CircularProgress, useColorMode } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import React from "react";

import { useSongTable } from "../hooks/useSongTable";
import { useAppStore } from "../store/AppStore";

import SongTableContextMenu, {
  SongTableContextMenuItem,
} from "./SongTableContextMenu";

import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "@/app/agGrid.css";
import { Song } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";
import { SongTableKeyType } from "@/utils/SongTableUtils";

export type SongTableProps = {
  id: string;
  songTableKeyType: SongTableKeyType;
  songs: Song[];
  tableColumns: SongTableColumn[];
  isSortingEnabled: boolean;
  isReorderingEnabled: boolean;
  isGlobalFilterEnabled: boolean;
  contextMenuItems: SongTableContextMenuItem[][];
  onSongsReordered: (orderedSongs: Song[]) => void;
  onColumnsUpdated: (updatedColumns: SongTableColumn[]) => void;
  onSongsSelected: (selectedSongs: Song[]) => void;
  onDoubleClicked: (song: Song, songs: Song[]) => void;
  getRowClassBySong?: (row: Song) => string | string[] | undefined;
};

export default function SongTable(props: SongTableProps) {
  const {
    ref,
    gridRef,
    rowData,
    columnDefs,
    onContextMenuOpen,
    onSortChanged,
    onColumnsMoved,
    onColumnsResized,
    onRowDragEnd,
    onRowDoubleClicked,
    onSelectionChanged,
    onRowDataUpdated,
    getRowId,
    getRowClass,
  } = useSongTable(props);
  const isSongTableLoading = useAppStore((state) => state.isSongTableLoading);
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
          onSortChanged={onSortChanged}
          onColumnMoved={onColumnsMoved}
          onRowDragEnd={onRowDragEnd}
          onRowDoubleClicked={onRowDoubleClicked}
          onColumnResized={onColumnsResized}
          onCellContextMenu={onContextMenuOpen}
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
          getRowClass={getRowClass}
          getRowId={getRowId}
        ></AgGridReact>
        {isSongTableLoading && (
          <CircularProgress
            top={"50%"}
            left={"50%"}
            transform={"translate(-50%, -50%)"}
            position={"absolute"}
            isIndeterminate
            color="brand.500"
          />
        )}
      </div>
      <SongTableContextMenu
        id={props.id}
        items={props.contextMenuItems}
      ></SongTableContextMenu>
    </>
  );
}
