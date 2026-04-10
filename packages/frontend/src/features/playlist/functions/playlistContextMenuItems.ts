import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { NotificationParams } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuItem } from "../../context_menu";
import { getTargetSongsForContextMenu } from "../../song_table/functions/songTableKey";
import type {
	SongTableContextMenuItemParams,
	SongTableKeyType,
} from "../../song_table/types/songTableTypes";

export function getSongTableContextMenuRemove(
	songTableKeyType: SongTableKeyType,
	playlistName: string,
	showNotification: (params: NotificationParams) => void,
	removePlaylistSongs: (params: {
		targetSongs: Song[];
		allSongs: Song[];
		playlistName: string;
		songTableKeyType: SongTableKeyType;
	}) => Promise<void>,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Remove",
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
			await removePlaylistSongs({
				targetSongs,
				allSongs: params.sortedSongs,
				playlistName,
				songTableKeyType,
			});
			showNotification({
				status: "success",
				title: "Songs successfully removed",
				description: `${targetSongs.length} songs have been removed from the playlist "${playlistName}".`,
			});
		},
	};
}

export function getSongTableContextMenuClear(
	playlistName: string,
	showNotification: (params: NotificationParams) => void,
	clearPlaylist: (name: string) => Promise<void>,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Clear",
		onClick: async (
			_params?: SongTableContextMenuItemParams,
		): Promise<void> => {
			await clearPlaylist(playlistName);
			showNotification({
				status: "success",
				title: "Songs successfully cleared",
				description: `All songs have been removed from the playlist "${playlistName}".`,
			});
		},
	};
}

export function getSongTableContextMenuDropDuplicates(
	playlistName: string,
	showNotification: (params: NotificationParams) => void,
	dropDuplicatePlaylistSongs: (params: {
		sortedSongs: Song[];
		playlistName: string;
	}) => Promise<number>,
): ContextMenuItem<SongTableContextMenuItemParams> {
	return {
		name: "Drop Duplicates",
		onClick: async (params?: SongTableContextMenuItemParams): Promise<void> => {
			if (params === undefined) {
				return;
			}
			if (params.sortedSongs.length === 0) {
				return;
			}
			const duplicateCount = await dropDuplicatePlaylistSongs({
				sortedSongs: params.sortedSongs,
				playlistName,
			});
			if (duplicateCount === 0) {
				showNotification({
					status: "info",
					title: "No duplicated songs",
					description: "There are no duplicated songs to remove.",
				});
				return;
			}
			showNotification({
				status: "success",
				title: "Songs successfully removed",
				description: `${duplicateCount} duplicated songs have been removed from the playlist "${playlistName}".`,
			});
		},
	};
}
