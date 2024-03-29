import { Box } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useRef, useState } from "react";

import { CenterSpinner } from "../../loading";
import {
  ColumnEditModal,
  SongTable,
  useCommonColumnEditModalProps,
} from "../../song_table";
import { usePlaylistSelectModalProps } from "../hooks/usePlaylistSelectModalProps";
import { usePlaylistSongTableProps } from "../hooks/usePlaylistSongTableProps";

import { PlaylistSelectModal } from "./PlaylistSelectModal";

export function PlaylistContent() {
  const songsToAddToPlaylistRef = useRef<Song[]>([]);
  const [isOpenPlaylistSelectModal, setIsOpenPlaylistSelectModal] =
    useState(false);
  const [isOpenColumnEditModal, setIsOpenColumnEditModal] = useState(false);

  const songTableProps = usePlaylistSongTableProps(
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
    setIsOpenColumnEditModal,
  );

  const playlistSelectModalProps = usePlaylistSelectModalProps(
    isOpenPlaylistSelectModal,
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
  );

  const columnEditModalProps = useCommonColumnEditModalProps(
    isOpenColumnEditModal,
    setIsOpenColumnEditModal,
  );

  if (songTableProps === undefined || columnEditModalProps === undefined) {
    return (
      <Box w="100%" h="100%" className="layout-border-top layout-border-left">
        <CenterSpinner />
      </Box>
    );
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
