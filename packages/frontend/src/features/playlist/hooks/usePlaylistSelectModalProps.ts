import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback, useRef, useState } from "react";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";

/**
 * Hook for playlist selection modal.
 *
 * Manages modal state and song selection for adding
 * songs to playlists.
 *
 * @returns Modal state and handlers
 */
export function usePlaylistSelectModal() {
	const notify = useNotification();

	const songsToAddToPlaylistRef = useRef<Song[]>([]);
	const [isPlaylistSelectModalOpen, setIsPlaylistSelectModalOpen] =
		useState(false);

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();

	const onOk = useCallback(
		async (playlist: Playlist) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			const commands = songsToAddToPlaylistRef.current.map(
				(song) =>
					new MpdRequest({
						profile,
						command: {
							case: "playlistadd",
							value: {
								name: playlist.name,
								uri: song.path,
							},
						},
					}),
			);
			if (commands.length === 0) {
				return;
			}

			await mpdClient.commandBulk(commands);
			setIsPlaylistSelectModalOpen(false);
			notify({
				status: "success",
				title: "Songs successfully added",
				description: `${songsToAddToPlaylistRef.current.length} songs have been added to ${playlist.name}.`,
			});
		},
		[mpdClient, notify, profile],
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
