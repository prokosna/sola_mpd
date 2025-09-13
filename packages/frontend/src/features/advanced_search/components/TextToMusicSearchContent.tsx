import { clone } from "@bufbuild/protobuf";
import { Box } from "@mantine/core";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
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
import { useTextToMusicSearchSongTableProps } from "../hooks/useTextToMusicSearchSongTableProps";

export function TextToMusicSearchContent() {
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();

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

	const onColumnsUpdated = useCallback(
		async (columns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = clone(SongTableStateSchema, songTableState);
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
