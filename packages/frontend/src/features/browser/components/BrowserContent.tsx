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
import { useBrowserSongTableProps } from "../hooks/useBrowserSongTableProps";

/**
 * Content component for the browser feature displaying song lists.
 *
 * Features:
 * - Song table with customizable columns
 * - Playlist management integration
 * - Column editing capabilities
 * - State persistence for table configuration
 * - Loading state handling
 *
 * @component
 */
export function BrowserContent() {
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

	const {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps,
	} = usePlaylistSelectModal();

	const songTableProps = useBrowserSongTableProps(
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
