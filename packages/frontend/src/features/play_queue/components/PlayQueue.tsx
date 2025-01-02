import { Box } from "@chakra-ui/react";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
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
 * Displays and manages the MPD play queue.
 *
 * Renders a customizable song table with support for selection,
 * context menu actions, column editing, and playlist integration.
 * Includes loading states and modals for user interactions.
 *
 * Supports drag-and-drop reordering and multi-song operations
 * through an interactive table interface.
 *
 * @returns Play queue component with table and modals
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
