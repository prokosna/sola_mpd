import { clone } from "@bufbuild/protobuf";
import { Box, Modal } from "@mantine/core";
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
import { useSimilaritySearchSongTableProps } from "../hooks/useSimilaritySearchSongTableProps";
import {
	useRefreshSimilaritySearchSongsState,
	useSetSimilaritySearchTargetSongState,
} from "../states/similaritySearchState";
import {
	useIsSimilaritySearchModalOpenState,
	useSetIsSimilaritySearchModalOpenState,
} from "../states/similaritySearchUiState";

/**
 * Renders the similarity search modal.
 *
 * @returns The similarity search modal component
 */
export function SimilaritySearchModal() {
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);

	const {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps,
	} = usePlaylistSelectModal();

	const songTableProps = useSimilaritySearchSongTableProps(
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

	const isSimilaritySearchModalOpen = useIsSimilaritySearchModalOpenState();
	const setIsSimilaritySearchModalOpen =
		useSetIsSimilaritySearchModalOpenState();
	const setSimilaritySearchTargetSong = useSetSimilaritySearchTargetSongState();
	const refreshSimilaritySearchSongsState =
		useRefreshSimilaritySearchSongsState();

	const handleClose = useCallback(() => {
		setIsSimilaritySearchModalOpen(false);
		setSimilaritySearchTargetSong(undefined);
		refreshSimilaritySearchSongsState();
	}, [
		setIsSimilaritySearchModalOpen,
		setSimilaritySearchTargetSong,
		refreshSimilaritySearchSongsState,
	]);

	if (songTableProps === undefined || columnEditModalProps === undefined) {
		return <CenterSpinner />;
	}

	return (
		<Modal
			opened={isSimilaritySearchModalOpen}
			onClose={handleClose}
			title="Similar Songs"
			size="80%"
			centered
			styles={{
				body: {
					display: "flex",
					flexDirection: "column",
					height: "80vh",
				},
			}}
		>
			<Box
				w="100%"
				flex={1}
				style={{
					border: "1px solid var(--mantine-color-default-border)",
				}}
			>
				<SongTable {...songTableProps} />
				<PlaylistSelectModal {...playlistSelectModalProps} />
				<ColumnEditModal {...columnEditModalProps} />
			</Box>
		</Modal>
	);
}
