"use client";
import { Box } from "@chakra-ui/react";
import React from "react";

import ColumnEditModal from "../../global/components/ColumnEditModal";
import PlaylistSelectModal from "../../global/components/PlaylistSelectModal";
import SongTable from "../../global/components/SongTable";
import PluginExecutionModal from "../../plugin/components/PluginExecutionModal";
import { usePlayQueueSongTable } from "../hooks/usePlayQueueSongTable";

export default function PlayQueue() {
  const { playlistModalProps, columnModalProps, tableProps, pluginModalProps } =
    usePlayQueueSongTable();

  return (
    <>
      <Box w="100%" h="100%">
        <SongTable {...tableProps}></SongTable>
        <PlaylistSelectModal {...playlistModalProps}></PlaylistSelectModal>
        <ColumnEditModal {...columnModalProps}></ColumnEditModal>
        <PluginExecutionModal {...pluginModalProps}></PluginExecutionModal>
      </Box>
    </>
  );
}
