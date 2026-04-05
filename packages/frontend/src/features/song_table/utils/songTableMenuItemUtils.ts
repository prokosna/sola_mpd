import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { MutableRefObject } from "react";

import type { NotificationParams } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem } from "../../context_menu";
import type { MpdClient } from "../../mpd";
import {
	buildAddCommands,
	buildReplaceQueueCommands,
} from "../functions/songTableCommand";
import { getTargetSongsForContextMenu } from "../functions/songTableKey";
import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
} from "../types/songTableTypes";

export function getSongTableContextMenuAdd(
	songTableKeyType: SongTableKeyType,
	showNotification: (params: NotificationParams) => void,
	profile?: MpdProfile,
	mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Add",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (
				params === undefined ||
				mpdClient === undefined ||
				profile === undefined
			) {
				return;
			}
			const targetSongs = getTargetSongsForContextMenu(
				params,
				songTableKeyType,
			);
			if (targetSongs.length === 0) {
				return;
			}
			const commands = buildAddCommands(targetSongs, profile);
			await mpdClient.commandBulk(commands);
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
	profile?: MpdProfile,
	mpdClient?: MpdClient,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Replace",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (
				params === undefined ||
				mpdClient === undefined ||
				profile === undefined
			) {
				return;
			}
			const targetSongs = getTargetSongsForContextMenu(
				params,
				songTableKeyType,
			);
			if (targetSongs.length === 0) {
				return;
			}
			const commands = buildReplaceQueueCommands(targetSongs, profile);
			await mpdClient.commandBulk(commands);
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
