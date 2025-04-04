import { Box } from "@chakra-ui/react";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useState } from "react";

import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	useColumnEditModalProps,
} from "../../song_table";
import { useHandleSearchColumnsUpdated } from "../hooks/useHandleSearchColumnsUpdated";
import { useSearchSongTableProps } from "../hooks/useSearchSongTableProps";
import { useEditingSearchState } from "../states/searchEditState";

/**
 * Search content area component.
 *
 * Manages song table, column editing, and playlist selection.
 *
 * @returns Content component
 */
export function SearchContent() {
	const editingSearch = useEditingSearchState();
	const handleSearchColumnsUpdated = useHandleSearchColumnsUpdated();

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

	const {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps,
	} = usePlaylistSelectModal();

	const songTableProps = useSearchSongTableProps(
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		setIsColumnEditModalOpen,
	);

	const onColumnsUpdated = useCallback(
		async (columns: SongTableColumn[]) => {
			await handleSearchColumnsUpdated(editingSearch, columns);
		},
		[editingSearch, handleSearchColumnsUpdated],
	);
	const columnEditModalProps = useColumnEditModalProps(
		isColumnEditModalOpen,
		editingSearch.columns,
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
