import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { usePlaylistSelectModal } from "../../../playlist";
import {
	songTableServerStateAtom,
	updateSongTableColumnTagsActionAtom,
	useColumnEditModalProps,
} from "../../../song_table";
import { BrowserContentView } from "../../common/components/BrowserContentView";
import { useRecentlyAddedSongTableProps } from "../hooks/useRecentlyAddedSongTableProps";

export function RecentlyAddedContent() {
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

	const songTableProps = useRecentlyAddedSongTableProps(
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

	return (
		<BrowserContentView
			{...{ songTableProps, playlistSelectModalProps, columnEditModalProps }}
		/>
	);
}
