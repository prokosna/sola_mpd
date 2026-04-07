import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { MutableRefObject } from "react";

import type { NotificationParams } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem } from "../../context_menu";
import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
} from "../types/songTableTypes";
import { getTargetSongsForContextMenu } from "./songTableKey";

export function getSongTableContextMenuAdd(
	songTableKeyType: SongTableKeyType,
	showNotification: (params: NotificationParams) => void,
	addSongsToQueue: (songs: Song[]) => Promise<void>,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Add",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (params === undefined) {
				return;
			}
			const targetSongs = getTargetSongsForContextMenu(
				params,
				songTableKeyType,
			);
			if (targetSongs.length === 0) {
				return;
			}
			await addSongsToQueue(targetSongs);
			showNotification({
				status: "success",
				title: "Added songs to queue",
				description: `${targetSongs.length} songs have been added to the play queue.`,
			});
		},
	};
}

export function getSongTableContextMenuReplace(
	songTableKeyType: SongTableKeyType,
	showNotification: (params: NotificationParams) => void,
	replaceQueueWithSongs: (songs: Song[]) => Promise<void>,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Replace",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (params === undefined) {
				return;
			}
			const targetSongs = getTargetSongsForContextMenu(
				params,
				songTableKeyType,
			);
			if (targetSongs.length === 0) {
				return;
			}
			await replaceQueueWithSongs(targetSongs);
			showNotification({
				status: "success",
				title: "Replaced queue with selected songs",
				description: `The play queue has been replaced with ${targetSongs.length} songs.`,
			});
		},
	};
}

export function getSongTableContextMenuAddToPlaylist(
	songTableKeyType: SongTableKeyType,
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Add to Playlist",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (params === undefined) {
				return;
			}
			const targetSongs = getTargetSongsForContextMenu(
				params,
				songTableKeyType,
			);
			if (targetSongs.length === 0) {
				return;
			}
			songsToAddToPlaylistRef.current = targetSongs;
			setIsPlaylistSelectModalOpen(true);
		},
	};
}

export function getSongTableContextMenuEditColumns(
	setIsColumnEditModalOpen: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Edit Columns",
		onClick: async (): Promise<void> => {
			setIsColumnEditModalOpen(true);
		},
	};
}

export function getSongTableContextMenuSimilarSongs(
	setSimilaritySearchTargetSong: (song: Song | undefined) => void,
	refreshSimilaritySearchSongs: () => void,
	setIsSimilaritySearchModalOpen: (open: boolean) => void,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Similar Songs",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (params === undefined) {
				return;
			}
			const { clickedSong } = params;
			setIsSimilaritySearchModalOpen(true);
			setSimilaritySearchTargetSong(clickedSong);
			refreshSimilaritySearchSongs();
		},
	};
}
