import { clone } from "@bufbuild/protobuf";
import { Box, Modal } from "@mantine/core";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useColumnEditModalProps,
} from "../../song_table";
import { useSimilaritySearchSongTableProps } from "../hooks/useSimilaritySearchSongTableProps";
import { refreshSimilaritySearchSongsActionAtom } from "../states/actions/refreshSimilaritySearchSongsActionAtom";
import { setIsSimilaritySearchModalOpenActionAtom } from "../states/actions/setIsSimilaritySearchModalOpenActionAtom";
import { setSimilaritySearchTargetSongActionAtom } from "../states/actions/setSimilaritySearchTargetSongActionAtom";
import { isSimilaritySearchModalOpenAtom } from "../states/atoms/similaritySearchUiAtom";

/**
 * Renders the similarity search modal.
 *
 * @returns The similarity search modal component
 */
export function SimilaritySearchModal() {
	const songTableState = useAtomValue(songTableStateAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);

	const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);
	const contextMenuAnchorRef = useRef<HTMLDivElement | null>(null);

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

	const isSimilaritySearchModalOpen = useAtomValue(
		isSimilaritySearchModalOpenAtom,
	);
	const setIsSimilaritySearchModalOpen = useSetAtom(
		setIsSimilaritySearchModalOpenActionAtom,
	);
	const setSimilaritySearchTargetSong = useSetAtom(
		setSimilaritySearchTargetSongActionAtom,
	);
	const refreshSimilaritySearchSongsState = useSetAtom(
		refreshSimilaritySearchSongsActionAtom,
	);

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
		<Modal.Root
			opened={isSimilaritySearchModalOpen}
			onClose={handleClose}
			size="80%"
			centered
		>
			<Modal.Overlay />
			<Modal.Content ref={contextMenuAnchorRef}>
				<Modal.Header>
					<Modal.Title>Similar Songs</Modal.Title>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body
					style={{
						display: "flex",
						flexDirection: "column",
						height: "80vh",
					}}
				>
					<Box
						w="100%"
						flex={1}
						style={{
							border: "1px solid var(--mantine-color-default-border)",
						}}
					>
						<SongTable
							{...songTableProps}
							contextMenuAnchorRef={contextMenuAnchorRef}
						/>
						<PlaylistSelectModal {...playlistSelectModalProps} />
						<ColumnEditModal {...columnEditModalProps} />
					</Box>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
}
