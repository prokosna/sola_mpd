import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useSimilarSongsContextMenuItems } from "../../advanced_search";
import { usePluginContextMenuItems } from "../../plugin";
import {
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	songTableColumnViewAtom,
	useHandleLibraryColumnsUpdated,
	useHandleSongDoubleClick,
	useSongTableContextMenuSections,
} from "../../song_table";
import {
	getSongTableContextMenuClear,
	getSongTableContextMenuDropDuplicates,
	getSongTableContextMenuRemove,
} from "../functions/playlistContextMenuItems";
import { clearPlaylistActionAtom } from "../states/actions/clearPlaylistActionAtom";
import { dropDuplicatePlaylistSongsActionAtom } from "../states/actions/dropDuplicatePlaylistSongsActionAtom";
import { removePlaylistSongsActionAtom } from "../states/actions/removePlaylistSongsActionAtom";
import { reorderPlaylistActionAtom } from "../states/actions/reorderPlaylistActionAtom";
import { setIsPlaylistLoadingActionAtom } from "../states/actions/setIsPlaylistLoadingActionAtom";
import { selectedPlaylistAtom } from "../states/atoms/playlistAtom";
import { playlistVisibleSongsAtom } from "../states/atoms/playlistSongsAtom";
import {
	isPlaylistLoadingAtom,
	syncPlaylistLoadingEffectAtom,
} from "../states/atoms/playlistUiAtom";

export function usePlaylistSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.INDEX_PATH;

	const notify = useNotification();

	useAtomValue(syncPlaylistLoadingEffectAtom);
	const isLoading = useAtomValue(isPlaylistLoadingAtom);
	const songs = useAtomValue(playlistVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const selectedPlaylist = useAtomValue(selectedPlaylistAtom);
	const noRows =
		selectedPlaylist === undefined
			? { isIdle: true, message: "Select a playlist to show its songs." }
			: { isIdle: false, message: "This playlist is empty." };
	const setIsPlaylistLoading = useSetAtom(setIsPlaylistLoadingActionAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);
	const removePlaylistSongs = useSetAtom(removePlaylistSongsActionAtom);
	const clearPlaylist = useSetAtom(clearPlaylistActionAtom);
	const dropDuplicatePlaylistSongs = useSetAtom(
		dropDuplicatePlaylistSongsActionAtom,
	);
	const reorderPlaylist = useSetAtom(reorderPlaylistActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_PLAYLIST,
		songTableKeyType,
	);

	const similarSongsContextMenuItems = useSimilarSongsContextMenuItems();

	const songTableContextMenuSections = useSongTableContextMenuSections({
		songTableKeyType,
		hasQueueItems: true,
		sourceSections:
			selectedPlaylist === undefined
				? []
				: [
						[
							getSongTableContextMenuRemove(
								songTableKeyType,
								selectedPlaylist.name,
								notify,
								removePlaylistSongs,
							),
							getSongTableContextMenuClear(
								selectedPlaylist.name,
								notify,
								clearPlaylist,
							),
							getSongTableContextMenuDropDuplicates(
								selectedPlaylist.name,
								notify,
								dropDuplicatePlaylistSongs,
							),
						],
					],
		extraSections: [similarSongsContextMenuItems, pluginContextMenuItems],
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		setIsColumnEditModalOpen,
	});
	const contextMenuSections =
		selectedPlaylist === undefined ? [] : songTableContextMenuSections;

	const onSongsReordered = useCallback(
		async (orderedSongs: Song[]) => {
			if (selectedPlaylist === undefined) {
				return;
			}
			await reorderPlaylist({
				orderedSongs,
				playlistName: selectedPlaylist.name,
			});
		},
		[reorderPlaylist, selectedPlaylist],
	);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsPlaylistLoading(false);
	}, [setIsPlaylistLoading]);

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_PLAYLIST_MAIN_PANE,
		songTableKeyType,
		songs,
		columns,
		isSortingEnabled: false,
		isReorderingEnabled: true,
		isGlobalFilterEnabled: true,
		contextMenuSections,
		isLoading,
		noRows,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
