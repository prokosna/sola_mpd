import { Box } from "@chakra-ui/react";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useState } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
  ColumnEditModal,
  SongTable,
  useColumnEditModalProps,
  useSongTableState,
  useUpdateSongTableState,
} from "../../song_table";
import { useAllSongsSongTableProps } from "../hooks/useAllSongsSongTableProps";

/**
 * AllSongs component for displaying and managing all songs.
 *
 * This component renders a song table with all available songs,
 * and provides functionality for playlist selection and column editing.
 *
 * @returns JSX.Element The rendered AllSongs component
 */
export function AllSongs() {
  const songTableState = useSongTableState();
  const updateSongTableState = useUpdateSongTableState();

  const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

  const {
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    playlistSelectModalProps,
  } = usePlaylistSelectModal();

  const songTableProps = useAllSongsSongTableProps(
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
      <Box w="100%" h="100%">
        <SongTable {...songTableProps} />
        <PlaylistSelectModal {...playlistSelectModalProps} />
        <ColumnEditModal {...columnEditModalProps} />
      </Box>
    </>
  );
}
