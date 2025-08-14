import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { useCallback } from "react";

import {
	Button,
	Checkbox,
	Group,
	Modal,
	Select,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAddPlaylist } from "../hooks/useAddPlaylist";
import { usePlaylistsState } from "../states/playlistState";

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
	const playlists = usePlaylistsState();
	const addPlaylist = useAddPlaylist();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			playlistName: "",
			isNewPlaylist: false,
		},
		validate: {
			playlistName: (value, values) => {
				if (values.isNewPlaylist) {
					if (value === "") {
						return "Playlist name can't be empty";
					}
					if (playlists?.find((playlist) => playlist.name === value)) {
						return "Playlist name already exists";
					}
				} else {
					if (!value) {
						return "Please select a playlist";
					}
					if (!playlists?.find((playlist) => playlist.name === value)) {
						return "Selected playlist doesn't exist";
					}
				}
			},
		},
	});

	const handleSubmit = useCallback(
		async (values: typeof form.values) => {
			const playlist = new Playlist({
				name: values.playlistName,
			});
			if (values.isNewPlaylist) {
				await addPlaylist(playlist);
			}
			props.onOk(playlist);
			form.reset();
		},
		[addPlaylist, props, form],
	);

	const handleClose = useCallback(() => {
		props.onCancel();
		form.reset();
	}, [props, form]);

	return (
		<>
			<Modal
				centered
				opened={props.isOpen}
				onClose={handleClose}
				title="Select a playlist"
			>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					{form.getValues().isNewPlaylist ? (
						<TextInput
							withAsterisk
							label="Playlist name"
							placeholder="New playlist name"
							key={form.key("playlistName")}
							{...form.getInputProps("playlistName")}
						/>
					) : (
						<Select
							placeholder="Select a playlist"
							data={playlists?.map((playlist) => playlist.name) || []}
							key={form.key("playlistName")}
							{...form.getInputProps("playlistName")}
						/>
					)}

					<Checkbox
						label="Create a new playlist"
						key={form.key("isNewPlaylist")}
						{...form.getInputProps("isNewPlaylist", { type: "checkbox" })}
					/>

					<Group justify="flex-end">
						<Button type="submit">Add</Button>
						<Button onClick={handleClose} variant="default">
							Cancel
						</Button>
					</Group>
				</form>
			</Modal>
		</>
	);
}
