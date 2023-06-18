"use client";
import { Box } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import { usePlaylistResizablePane } from "../hooks/usePlaylistResizablePane";

import PlaylistMainPane from "./PlaylistMainPane";
import PlaylistSelectPane from "./PlaylistSelectPane";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function Playlist() {
  const { isLoading, leftPaneWidthStr, rightPaneWidthStr, onPaneWidthChanged } =
    usePlaylistResizablePane();

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
            <PlaylistSelectPane></PlaylistSelectPane>
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidthStr}>
            <PlaylistMainPane></PlaylistMainPane>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
