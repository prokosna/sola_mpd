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
import { usePlayQueueSongTableProps } from "../hooks/usePlayQueueSongTableProps";

/**
 * PlayQueue component for rendering the play queue view.
 * This component displays the current play queue, allowing users to view,
 * manage, and interact with the list of songs queued for playback.
 *
 * @returns JSX.Element The rendered PlayQueue component
 */
export function PlayQueue() {
  const songTableState = useSongTableState();
  const updateSongTableState = useUpdateSongTableState();

  const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

  const {
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    playlistSelectModalProps,
  } = usePlaylistSelectModal();

  const songTableProps = usePlayQueueSongTableProps(
    songsToAddToPlaylistRef,
    setIsPlaylistSelectModalOpen,
    setIsColumnEditModalOpen,
  );

  const onColumnsUpdated = useCallback(
    async (columns: SongTableColumn[]) => {
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
    songTableState.columns,
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
