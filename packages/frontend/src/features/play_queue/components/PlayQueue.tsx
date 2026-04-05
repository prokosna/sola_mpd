import { clone } from "@bufbuild/protobuf";
import { Box } from "@mantine/core";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useColumnEditModalProps,
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
	const songTableState = useAtomValue(songTableStateAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);

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
			const newSongTableState = clone(SongTableStateSchema, songTableState);
			newSongTableState.columns = columns;
			await updateSongTableState({
				state: newSongTableState,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
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
		return <CenterSpinner />;
	}

	return (
		<Box w="100%" h="100%">
			<SongTable {...songTableProps} />
			<PlaylistSelectModal {...playlistSelectModalProps} />
			<ColumnEditModal {...columnEditModalProps} />
		</Box>
	);
}
