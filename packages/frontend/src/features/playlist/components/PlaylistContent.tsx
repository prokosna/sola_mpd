import { Box } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { CenterSpinner } from "../../loading";
import {
	ColumnEditModal,
	SongTable,
	songTableServerStateAtom,
	updateSongTableColumnTagsActionAtom,
	useColumnEditModalProps,
} from "../../song_table";
import { usePlaylistSelectModal } from "../hooks/usePlaylistSelectModalProps";
import { usePlaylistSongTableProps } from "../hooks/usePlaylistSongTableProps";
import { PlaylistSelectModal } from "./PlaylistSelectModal";

export function PlaylistContent() {
	const songTableServerState = useAtomValue(songTableServerStateAtom);
	const updateSongTableColumnTags = useSetAtom(
		updateSongTableColumnTagsActionAtom,
	);

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
	const columnEditModalProps = useColumnEditModalProps(
		isColumnEditModalOpen,
		songTableServerState?.columnTags ?? [],
		setIsColumnEditModalOpen,
		updateSongTableColumnTags,
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
