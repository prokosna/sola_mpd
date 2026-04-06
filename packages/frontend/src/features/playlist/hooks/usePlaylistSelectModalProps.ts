import type { Playlist } from "@sola_mpd/shared/src/models/playlist_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useCallback, useRef, useState } from "react";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { buildAddSongsToPlaylistCommands } from "../functions/playlistSongOperations";

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

	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);

	const onOk = useCallback(
		async (playlist: Playlist) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			const commands = buildAddSongsToPlaylistCommands(
				songsToAddToPlaylistRef.current,
				playlist.name,
				profile,
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
