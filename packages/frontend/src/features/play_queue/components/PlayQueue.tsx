import { Box } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useRef, useState } from "react";

import { CenterSpinner } from "../../loading";
import {
  PlaylistSelectModal,
  usePlaylistSelectModalProps,
} from "../../playlist";
import {
  ColumnEditModal,
  SongTable,
  useCommonColumnEditModalProps,
  useCommonSongTableState,
  useUpdateCommonSongTableColumnsAction,
} from "../../song_table";
import { usePlayQueueSongTableProps } from "../hooks/usePlayQueueSongTableProps";

export function PlayQueue() {
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

  const songTableProps = usePlayQueueSongTableProps(
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
    columnEditModalProps.open,
  );

  const playlistSelectModalProps = usePlaylistSelectModalProps(
    isOpenPlaylistSelectModal,
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
  );

  if (songTableProps === undefined || columnEditModalProps === undefined) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <Box w="100%" h="100%">
        <SongTable {...songTableProps} />
        <PlaylistSelectModal {...playlistSelectModalProps} />
        <ColumnEditModal {...columnEditModalProps} />
      </Box>
    </>
  );
}
