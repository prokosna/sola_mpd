"use client";
import { Box } from "@chakra-ui/react";
import React from "react";

import ColumnEditModal from "../../global/components/ColumnEditModal";
import PlaylistSelectModal from "../../global/components/PlaylistSelectModal";
import SongTable from "../../global/components/SongTable";
import PluginExecutionModal from "../../plugin/components/PluginExecutionModal";
import { useBrowserSongTable } from "../hooks/useBrowserSongTable";

export default function BrowserMainPane() {
  const { playlistModalProps, columnModalProps, tableProps, pluginModalProps } =
    useBrowserSongTable();
  return (
    <>
      <Box w="100%" h="full">
        <SongTable {...tableProps}></SongTable>
        <PlaylistSelectModal {...playlistModalProps}></PlaylistSelectModal>
        <ColumnEditModal {...columnModalProps}></ColumnEditModal>
        <PluginExecutionModal {...pluginModalProps}></PluginExecutionModal>
      </Box>
    </>
  );
}
