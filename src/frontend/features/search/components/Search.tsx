"use client";
import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import { useSearchResizablePane } from "../hooks/useSearchResizablePane";

import SearchMainPane from "./SearchMainPane";
import SearchSidePane from "./SearchSidePane";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function Search() {
  const { isLoading, leftPaneWidthStr, rightPaneWidthStr, onPaneWidthChanged } =
    useSearchResizablePane();
  const { colorMode } = useColorMode();

  if (
    isLoading ||
    leftPaneWidthStr === undefined ||
    rightPaneWidthStr === undefined
  ) {
    return <CenterSpinner></CenterSpinner>;
  }

  return (
    <>
      <Box w="100%" h="full">
        <Allotment
          className={
            colorMode === "light" ? "allotment-light" : "allotment-dark"
          }
          onChange={(sizes) => {
            onPaneWidthChanged(sizes[0], sizes[1]);
          }}
        >
          <Allotment.Pane preferredSize={leftPaneWidthStr} minSize={200}>
            <SearchSidePane></SearchSidePane>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidthStr}>
            <SearchMainPane></SearchMainPane>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
