import { Box, Modal } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { CenterSpinner } from "../../loading";
import { PlaylistSelectModal, usePlaylistSelectModal } from "../../playlist";
import {
	ColumnEditModal,
	SongTable,
	songTableServerStateAtom,
	updateSongTableColumnTagsActionAtom,
	useColumnEditModalProps,
} from "../../song_table";
import { useSimilaritySearchSongTableProps } from "../hooks/useSimilaritySearchSongTableProps";
import { refreshSimilaritySearchSongsActionAtom } from "../states/actions/refreshSimilaritySearchSongsActionAtom";
import { setIsSimilaritySearchModalOpenActionAtom } from "../states/actions/setIsSimilaritySearchModalOpenActionAtom";
import { setSimilaritySearchTargetSongActionAtom } from "../states/actions/setSimilaritySearchTargetSongActionAtom";
import { isSimilaritySearchModalOpenAtom } from "../states/atoms/similaritySearchUiAtom";

export function SimilaritySearchModal() {
	const songTableServerState = useAtomValue(songTableServerStateAtom);
	const updateSongTableColumnTags = useSetAtom(
		updateSongTableColumnTagsActionAtom,
	);

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
	const columnEditModalProps = useColumnEditModalProps(
		isColumnEditModalOpen,
		songTableServerState?.columnTags ?? [],
		setIsColumnEditModalOpen,
		updateSongTableColumnTags,
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
