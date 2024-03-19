"use client";
import { Box } from "@chakra-ui/react";
import React from "react";

import ColumnEditModal from "../../global/components/ColumnEditModal";
import PlaylistSelectModal from "../../global/components/PlaylistSelectModal";
import SongTable from "../../global/components/SongTable";
import PluginExecutionModal from "../../plugin/components/PluginExecutionModal";
import { useSearchSongTable } from "../hooks/useSearchSongTable";

export default function SearchMainPane() {
  const { playlistModalProps, columnModalProps, tableProps, pluginModalProps } =
    useSearchSongTable();

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
