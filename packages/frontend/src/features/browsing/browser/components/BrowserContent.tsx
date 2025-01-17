import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useState } from "react";

import { UpdateMode } from "../../../../types/stateTypes";
import { usePlaylistSelectModal } from "../../../playlist";
import {
	useColumnEditModalProps,
	useSongTableState,
	useUpdateSongTableState,
} from "../../../song_table";
import { BrowserContentView } from "../../common/components/BrowserContentView";
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

	return (
		<BrowserContentView
			{...{ songTableProps, playlistSelectModalProps, columnEditModalProps }}
		/>
	);
}
