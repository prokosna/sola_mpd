import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { addSongsToPlaylistActionAtom } from "../states/actions/addSongsToPlaylistActionAtom";

export function usePlaylistSelectModal() {
	const notify = useNotification();

	const songsToAddToPlaylistRef = useRef<Song[]>([]);
	const [isPlaylistSelectModalOpen, setIsPlaylistSelectModalOpen] =
		useState(false);

	const addSongsToPlaylist = useSetAtom(addSongsToPlaylistActionAtom);

	const onOk = useCallback(
		async (playlist: Playlist) => {
			const songs = songsToAddToPlaylistRef.current;
			if (songs.length === 0) {
				return;
			}

			await addSongsToPlaylist({
				songs,
				playlistName: playlist.name,
			});
			setIsPlaylistSelectModalOpen(false);
			notify({
				status: "success",
				title: "Songs successfully added",
				description: `${songs.length} songs have been added to ${playlist.name}.`,
			});
		},
		[addSongsToPlaylist, notify],
	);

	const onCancel = useCallback(async () => {
		songsToAddToPlaylistRef.current = [];
		setIsPlaylistSelectModalOpen(false);
	}, []);

	return {
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		playlistSelectModalProps: {
			isOpen: isPlaylistSelectModalOpen,
			onOk,
			onCancel,
		},
	};
}
