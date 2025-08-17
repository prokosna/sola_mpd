import { clone } from "@bufbuild/protobuf";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useState } from "react";
import { UpdateMode } from "../../../../types/stateTypes";
import { usePlaylistSelectModal } from "../../../playlist";
import {
	useColumnEditModalProps,
	useSongTableState,
	useUpdateSongTableState,
} from "../../../song_table";
import { BrowserContentView } from "../../common/components/BrowserContentView";
import { useRecentlyAddedSongTableProps } from "../hooks/useRecentlyAddedSongTableProps";

/**
 * Renders the content for recently added items.
 * This component handles the display of recently added songs in a table format,
 * including functionality for playlist selection and column editing.
 */
export function RecentlyAddedContent() {
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();

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

	return (
		<BrowserContentView
			{...{ songTableProps, playlistSelectModalProps, columnEditModalProps }}
		/>
	);
}
