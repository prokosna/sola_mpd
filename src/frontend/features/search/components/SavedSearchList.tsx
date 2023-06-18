import { Box, Flex, Text } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import React from "react";

import GenericContextMenu from "../../global/components/GenericContextMenu";
import { useSavedSearchList } from "../hooks/useSavedSearchList";

import { Search } from "@/models/search";

export default function SavedSearchList() {
  const { gridProps, contextMenuProps } = useSavedSearchList();

  return (
    <>
      <Box
        w="100%"
        h="100%"
        borderLeft={"1px solid"}
        borderColor={"gray.300"}
        backgroundColor={"#f8f8f8"}
      >
        <Flex w="100%" h="49px" alignItems={"center"}>
          <Text as={"b"} px={18}>
            Saved Searches
          </Text>
        </Flex>
        <div
          className="ag-theme-alpine"
          style={{ height: "calc(100% - 49px)", width: "100%" }}
        >
          <AgGridReact
            containerStyle={{
              "--ag-borders": "none",
              "--ag-borders-row": "single",
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
      <GenericContextMenu<Search>
        id={contextMenuProps.id}
        items={contextMenuProps.contextMenuItems}
      ></GenericContextMenu>
    </>
  );
}
