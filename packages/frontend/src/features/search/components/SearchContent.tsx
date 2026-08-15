import { Box } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	useColumnEditModalProps,
} from "../../song_table";
import { useSearchSongTableProps } from "../hooks/useSearchSongTableProps";
import { updateSearchColumnTagsActionAtom } from "../states/actions/updateSearchColumnTagsActionAtom";
import { searchColumnViewAtom } from "../states/atoms/searchColumnViewAtom";

export function SearchContent() {
	const columns = useAtomValue(searchColumnViewAtom);
	const updateSearchColumnTags = useSetAtom(updateSearchColumnTagsActionAtom);

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
		columns?.map((column) => column.tag) ?? [],
		setIsColumnEditModalOpen,
		updateSearchColumnTags,
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
