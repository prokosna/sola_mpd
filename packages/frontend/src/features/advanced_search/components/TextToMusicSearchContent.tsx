import { Alert, Box } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	songTableServerStateAtom,
	updateSongTableColumnTagsActionAtom,
	useColumnEditModalProps,
} from "../../song_table";
import { useTextToMusicSearchSongTableProps } from "../hooks/useTextToMusicSearchSongTableProps";
import { setIsTextToMusicSearchLoadingActionAtom } from "../states/actions/setIsTextToMusicSearchLoadingActionAtom";
import { textToMusicSearchSongsAtom } from "../states/atoms/textToMusicSearchAtom";

export function TextToMusicSearchContent() {
	const songTableServerState = useAtomValue(songTableServerStateAtom);
	const searchResult = useAtomValue(textToMusicSearchSongsAtom);
	const setIsTextToMusicSearchLoading = useSetAtom(
		setIsTextToMusicSearchLoadingActionAtom,
	);

	// The table is not rendered on error, so it cannot report completion itself.
	useEffect(() => {
		if (searchResult?.kind === "error") {
			setIsTextToMusicSearchLoading(false);
		}
	}, [searchResult, setIsTextToMusicSearchLoading]);
	const updateSongTableColumnTags = useSetAtom(
		updateSongTableColumnTagsActionAtom,
	);

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

	const {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps,
	} = usePlaylistSelectModal();

	const songTableProps = useTextToMusicSearchSongTableProps(
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
			{searchResult?.kind === "error" ? (
				<Alert color="gray" title="Not available yet" m="md">
					{searchResult.message}
				</Alert>
			) : (
				<SongTable {...songTableProps} />
			)}
			<PlaylistSelectModal {...playlistSelectModalProps} />
			<ColumnEditModal {...columnEditModalProps} />
		</Box>
	);
}
