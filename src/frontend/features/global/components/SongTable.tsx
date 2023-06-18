"use client";
import { AgGridReact } from "ag-grid-react";
import React from "react";

import { useSongTable } from "../hooks/useSongTable";

import SongTableContextMenu, {
  SongTableContextMenuItem,
} from "./SongTableContextMenu";

import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "@/app/agGrid.css";
import { Song } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";

export type SongTableProps = {
  id: string;
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
    getRowClass,
  } = useSongTable(props);

  return (
    <>
      <div
        className="ag-theme-alpine"
        style={{ height: "100%", width: "100%" }}
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
          animateRows={true}
          colResizeDefault={"shift"}
          rowSelection={"multiple"}
          rowDragManaged={true}
          rowDragMultiRow={true}
          preventDefaultOnContextMenu={true}
          rowClass={"ag-theme-alpine"}
          getRowClass={getRowClass}
        ></AgGridReact>
      </div>
      <SongTableContextMenu
        id={props.id}
        items={props.contextMenuItems}
      ></SongTableContextMenu>
    </>
  );
}
