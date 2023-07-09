"use client";
import { Box, useColorMode } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import React from "react";

import GenericContextMenu from "../../global/components/GenericContextMenu";
import { usePlaylistSelectList } from "../hooks/usePlaylistSelectList";

import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "@/app/agGrid.css";

import { Playlist } from "@/models/playlist";

export default function PlaylistSelectPane() {
  const { gridProps, contextMenuProps } = usePlaylistSelectList();
  const { colorMode } = useColorMode();

  return (
    <>
      <Box className="layout-border-left" w="100%" h="full">
        <div
          className={
            colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
          }
          style={{ height: "100%", width: "100%" }}
        >
          <AgGridReact
            containerStyle={{
              "--ag-borders": "none",
            }}
            rowData={gridProps.rowData}
            columnDefs={gridProps.columnDefs}
            onSelectionChanged={gridProps.onSelectionChanged}
            onCellContextMenu={gridProps.onContextMenuOpen}
            animateRows={false}
            colResizeDefault={"shift"}
            rowSelection={"single"}
            rowMultiSelectWithClick={false}
            suppressRowDeselection={false}
            rowDragManaged={false}
            rowDragMultiRow={false}
            suppressCellFocus={true}
            preventDefaultOnContextMenu={true}
            headerHeight={0}
          ></AgGridReact>
        </div>
      </Box>
      <GenericContextMenu<Playlist>
        id={contextMenuProps.id}
        items={contextMenuProps.contextMenuItems}
      ></GenericContextMenu>
    </>
  );
}
