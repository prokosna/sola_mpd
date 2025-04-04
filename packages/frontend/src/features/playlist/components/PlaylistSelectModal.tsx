import {
	Button,
	Checkbox,
	FormControl,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from "@chakra-ui/react";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { useCallback, useState } from "react";

import { useAddPlaylist } from "../hooks/useAddPlaylist";

import { PlaylistSelectModalFromList } from "./PlaylistSelectModalFromList";
import { PlaylistSelectModalNewPlaylist } from "./PlaylistSelectModalNewPlaylist";

export type PlaylistSelectModalProps = {
	isOpen: boolean;
	onOk: (playlist: Playlist) => Promise<void>;
	onCancel: () => Promise<void>;
};

/**
 * Modal for playlist selection or creation.
 *
 * @param props Modal control props
 * @param props.isOpen Visibility state
 * @param props.onOk Selection callback
 * @param props.onCancel Cancel callback
 * @returns Modal component
 */
export function PlaylistSelectModal(props: PlaylistSelectModalProps) {
	const addPlaylist = useAddPlaylist();

	const [isCreateNew, setIsCreateNew] = useState(false);
	const [playlistName, setPlaylistName] = useState("");
	const [isPlaylistNameOk, setIsPlaylistNameOk] = useState(false);

	const handleSelect = useCallback((name: string) => {
		setPlaylistName(name);
		setIsPlaylistNameOk(true);
	}, []);

	const handleInput = useCallback((name: string, isOk: boolean) => {
		setPlaylistName(name);
		setIsPlaylistNameOk(isOk);
	}, []);

	const handleSubmit = useCallback(async () => {
		const playlist = new Playlist({
			name: playlistName,
		});
		if (isCreateNew) {
			if (isPlaylistNameOk) {
				await addPlaylist(playlist);
			} else {
				return;
			}
		}
		props.onOk(playlist);
		setPlaylistName("");
		setIsCreateNew(false);
		setIsPlaylistNameOk(false);
	}, [addPlaylist, isCreateNew, isPlaylistNameOk, playlistName, props]);

	const handleClose = useCallback(() => {
		setPlaylistName("");
		setIsCreateNew(false);
		setIsPlaylistNameOk(false);
		props.onCancel();
	}, [props]);

	return (
		<>
			<Modal
				isCentered
				closeOnOverlayClick={false}
				isOpen={props.isOpen}
				onClose={handleClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Select a playlist</ModalHeader>
					<ModalBody pb={6}>
						{isCreateNew ? (
							<PlaylistSelectModalNewPlaylist onInput={handleInput} />
						) : (
							<PlaylistSelectModalFromList onSelect={handleSelect} />
						)}
						<FormControl>
							<Checkbox
								colorScheme="brand"
								checked={isCreateNew}
								onChange={(e) => {
									setIsCreateNew(e.target.checked);
									setIsPlaylistNameOk(false);
								}}
							>
								Create a new playlist
							</Checkbox>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button
							colorScheme="brand"
							mr={3}
							onClick={handleSubmit}
							isDisabled={playlistName === "" || !isPlaylistNameOk}
						>
							Add
						</Button>
						<Button onClick={handleClose} colorScheme="gray">
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
