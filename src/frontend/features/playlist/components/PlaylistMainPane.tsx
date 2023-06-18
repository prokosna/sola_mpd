"use client";
import { Box } from "@chakra-ui/react";
import React from "react";

import ColumnEditModal from "../../global/components/ColumnEditModal";
import PlaylistSelectModal from "../../global/components/PlaylistSelectModal";
import SongTable from "../../global/components/SongTable";
import PluginExecutionModal from "../../plugin/components/PluginExecutionModal";
import { usePlaylistSongTable } from "../hooks/usePlaylistSongTable";

export default function PlaylistMainPane() {
  const { playlistModalProps, columnModalProps, tableProps, pluginModalProps } =
    usePlaylistSongTable();

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
