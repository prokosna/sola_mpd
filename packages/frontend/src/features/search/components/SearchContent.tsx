import { Box } from "@mantine/core";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	useColumnEditModalProps,
} from "../../song_table";
import { applyTagsToSearchColumnView } from "../functions/search";
import { useHandleSearchColumnsUpdated } from "../hooks/useHandleSearchColumnsUpdated";
import { useSearchSongTableProps } from "../hooks/useSearchSongTableProps";
import { searchColumnViewAtom } from "../states/atoms/searchColumnViewAtom";

export function SearchContent() {
	const columns = useAtomValue(searchColumnViewAtom);
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

	const handleTagsUpdated = useCallback(
		(tags: Song_MetadataTag[]) => {
			handleSearchColumnsUpdated(
				applyTagsToSearchColumnView(tags, columns ?? []),
			);
		},
		[columns, handleSearchColumnsUpdated],
	);

	const columnEditModalProps = useColumnEditModalProps(
		isColumnEditModalOpen,
		columns?.map((column) => column.tag) ?? [],
		setIsColumnEditModalOpen,
		handleTagsUpdated,
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
