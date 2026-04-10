import { clone } from "@bufbuild/protobuf";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { UpdateMode } from "../../../../types/stateTypes";
import { usePlaylistSelectModal } from "../../../playlist";
import {
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useColumnEditModalProps,
} from "../../../song_table";
import { BrowserContentView } from "../../common/components/BrowserContentView";
import { useRecentlyAddedSongTableProps } from "../hooks/useRecentlyAddedSongTableProps";

export function RecentlyAddedContent() {
	const songTableState = useAtomValue(songTableStateAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);

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

	return (
		<BrowserContentView
			{...{ songTableProps, playlistSelectModalProps, columnEditModalProps }}
		/>
	);
}
