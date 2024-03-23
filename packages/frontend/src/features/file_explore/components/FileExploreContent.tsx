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
} from "../../song_table";
import { useFileExploreSongTableProps } from "../hooks/useFileExploreSongTableProps";

export function FileExploreContent() {
  const songsToAddToPlaylistRef = useRef<Song[]>([]);
  const [isOpenPlaylistSelectModal, setIsOpenPlaylistSelectModal] =
    useState(false);
  const [isOpenColumnEditModal, setIsOpenColumnEditModal] = useState(false);

  const songTableProps = useFileExploreSongTableProps(
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
    return <CenterSpinner />;
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
