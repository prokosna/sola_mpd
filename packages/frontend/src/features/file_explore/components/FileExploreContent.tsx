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
import { useFileExploreSongTableProps } from "../hooks/useFileExploreSongTableProps";

/**
 * Content component for the file explorer's main display area.
 *
 * Features:
 * - Customizable song table display
 * - Column management with edit modal
 * - Playlist integration
 * - Loading state handling
 * - State persistence
 *
 * Modals:
 * - Playlist selection for adding songs
 * - Column customization for table layout
 *
 * State Management:
 * - Table column configuration
 * - Selected songs tracking
 * - Modal visibility states
 *
 * @returns Rendered content component with table and modals
 */
export function FileExploreContent() {
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

	const {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps,
	} = usePlaylistSelectModal();

	const songTableProps = useFileExploreSongTableProps(
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
