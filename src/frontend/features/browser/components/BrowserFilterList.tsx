"use client";
import { useColorMode } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import React from "react";

import GenericContextMenu from "../../global/components/GenericContextMenu";
import { useBrowserFilterList } from "../hooks/useBrowserFilterList";

import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "@/app/agGrid.css";
import { SongMetadataTag } from "@/models/song";
import { SongTableUtils } from "@/utils/SongTableUtils";

export type BrowserFilterListProps = {
  tag: SongMetadataTag;
};

export default function BrowserFilterList(props: BrowserFilterListProps) {
  const { gridProps, contextMenuProps } = useBrowserFilterList(props.tag);
  const { colorMode } = useColorMode();

  return (
    <>
      <div
        className={
          colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
        }
        style={{ height: "100%", width: "100%" }}
        onContextMenu={(e) => gridProps.onContextMenuOpen(e)}
      >
        <AgGridReact
          ref={gridProps.gridRef}
          rowData={gridProps.rowData}
          columnDefs={gridProps.columnDefs}
          getRowId={(params) =>
            params.data[
              SongTableUtils.convertSongMetadataTagToDisplayName(props.tag)
            ]?.toString() || ""
          }
          onSelectionChanged={gridProps.onSelectionChanged}
          animateRows={false}
          colResizeDefault={"shift"}
          rowSelection={"multiple"}
          rowMultiSelectWithClick={true}
          suppressRowDeselection={false}
          rowDragManaged={false}
          rowDragMultiRow={false}
          suppressCellFocus={true}
          preventDefaultOnContextMenu={false}
        ></AgGridReact>
        <GenericContextMenu<void>
          id={contextMenuProps.id}
          items={contextMenuProps.contextMenuItems}
        ></GenericContextMenu>
      </div>
    </>
  );
}
