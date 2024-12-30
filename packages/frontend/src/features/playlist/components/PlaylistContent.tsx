import { Box } from "@chakra-ui/react";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useState } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import { CenterSpinner } from "../../loading";
import {
  ColumnEditModal,
  SongTable,
  useColumnEditModalProps,
  useSongTableState,
  useUpdateSongTableState,
} from "../../song_table";
import { usePlaylistSelectModal } from "../hooks/usePlaylistSelectModalProps";
import { usePlaylistSongTableProps } from "../hooks/usePlaylistSongTableProps";

import { PlaylistSelectModal } from "./PlaylistSelectModal";

/**
 * PlaylistContent component for displaying the content of the playlist.
 *
 * This component renders the main content area of the playlist, including
 * the song table, playlist select modal, and column edit modal. It manages
 * the state for these components and handles interactions such as updating
 * columns and adding songs to playlists.
 *
 * @returns The rendered PlaylistContent component
 */
export function PlaylistContent() {
  const songTableState = useSongTableState();
  const updateSongTableState = useUpdateSongTableState();

  const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

  const {
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    playlistSelectModalProps,
  } = usePlaylistSelectModal();

  const songTableProps = usePlaylistSongTableProps(
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    setIsColumnEditModalOpen,
  );

  const onColumnsUpdated = useCallback(
    async (columns: SongTableColumn[]) => {
      if (songTableState === undefined) {
        return;
      }
      const newSongTableState = songTableState.clone();
      newSongTableState.columns = columns;
      await updateSongTableState(
        newSongTableState,
        UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
      );
    },
    [songTableState, updateSongTableState],
  );
  const columnEditModalProps = useColumnEditModalProps(
    isColumnEditModalOpen,
    songTableState?.columns || [],
    setIsColumnEditModalOpen,
    onColumnsUpdated,
    async () => {},
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
