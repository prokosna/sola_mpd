import { clone } from "@bufbuild/protobuf";
import { Box } from "@mantine/core";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import { CenterSpinner } from "../../loading";
import {
	ColumnEditModal,
	SongTable,
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useColumnEditModalProps,
} from "../../song_table";
import { usePlaylistSelectModal } from "../hooks/usePlaylistSelectModalProps";
import { usePlaylistSongTableProps } from "../hooks/usePlaylistSongTableProps";
import { PlaylistSelectModal } from "./PlaylistSelectModal";

export function PlaylistContent() {
	const songTableState = useAtomValue(songTableStateAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);

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

	const onColumnsUpdated = useCallback(
		async (columns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = clone(SongTableStateSchema, songTableState);
			newSongTableState.columns = columns;
			await updateSongTableState({
				state: newSongTableState,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
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
