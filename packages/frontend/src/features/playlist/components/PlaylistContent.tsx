import { Box } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useRef, useState } from "react";

import { CenterSpinner } from "../../loading";
import {
  ColumnEditModal,
  SongTable,
  useCommonColumnEditModalProps,
  useCommonSongTableState,
  useUpdateCommonSongTableColumnsAction,
} from "../../song_table";
import { usePlaylistSelectModal } from "../hooks/usePlaylistSelectModal";
import { usePlaylistSongTableProps } from "../hooks/usePlaylistSongTableProps";

import { PlaylistSelectModal } from "./PlaylistSelectModal";

export function PlaylistContent() {
  const songsToAddToPlaylistRef = useRef<Song[]>([]);
  const [isOpenPlaylistSelectModal, setIsOpenPlaylistSelectModal] =
    useState(false);
  const commonSongTableState = useCommonSongTableState();
  const updateCommonSongTableColumnsAction =
    useUpdateCommonSongTableColumnsAction()(commonSongTableState);

  const columnEditModalProps = useCommonColumnEditModalProps(
    commonSongTableState,
    updateCommonSongTableColumnsAction,
  );

  const songTableProps = usePlaylistSongTableProps(
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
    columnEditModalProps.open,
  );

  const playlistSelectModalProps = usePlaylistSelectModal(
    isOpenPlaylistSelectModal,
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
  );

  if (songTableProps === undefined || columnEditModalProps === undefined) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <Box w="100%" h="full">
        <SongTable {...songTableProps} />
        <PlaylistSelectModal {...playlistSelectModalProps} />
        <ColumnEditModal {...columnEditModalProps} />
      </Box>
    </>
  );
}
