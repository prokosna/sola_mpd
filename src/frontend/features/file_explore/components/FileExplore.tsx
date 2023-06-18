"use client";
import { Box } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import { useFileExploreResizablePane } from "../hooks/useFileExploreResizablePane";

import FileExploreMainPane from "./FileExploreMainPane";
import FileExploreTreePane from "./FileExploreTreePane";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function FileExplore() {
  const { isLoading, leftPaneWidthStr, rightPaneWidthStr, onPaneWidthChanged } =
    useFileExploreResizablePane();

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
          onChange={(sizes) => {
            onPaneWidthChanged(sizes[0], sizes[1]);
          }}
        >
          <Allotment.Pane preferredSize={leftPaneWidthStr} minSize={200}>
            <FileExploreTreePane></FileExploreTreePane>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidthStr}>
            <FileExploreMainPane></FileExploreMainPane>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
