import { Box } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	useColumnEditModalProps,
} from "../../song_table";
import { useHandleSearchColumnsUpdated } from "../hooks/useHandleSearchColumnsUpdated";
import { useSearchSongTableProps } from "../hooks/useSearchSongTableProps";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";

export function SearchContent() {
	const columns = useAtomValue(searchSongTableColumnsAtom);
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

	const columnEditModalProps = useColumnEditModalProps(
		isColumnEditModalOpen,
		columns,
		setIsColumnEditModalOpen,
		handleSearchColumnsUpdated,
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
