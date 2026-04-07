import { clone } from "@bufbuild/protobuf";
import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAYLIST_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { useSimilaritySearchContextMenuProps } from "../../advanced_search";
import type { ContextMenuSection } from "../../context_menu";
import { usePluginContextMenuItems } from "../../plugin";
import {
	addSongsToQueueActionAtom,
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuSimilarSongs,
	replaceQueueWithSongsActionAtom,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	selectedSongsAtom,
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useHandleSongDoubleClick,
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

/**
 * Hook for playlist song table props.
 *
 * Manages table state, context menus, and song selection
 * for playlist content display.
 *
 * @param songsToAddToPlaylistRef Songs for playlist addition
 * @param setIsPlaylistSelectModalOpen Playlist modal control
 * @param setIsColumnEditModalOpen Column modal control
 * @returns Table props or undefined
 */
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
	const songTableState = useAtomValue(songTableStateAtom);
	const selectedPlaylist = useAtomValue(selectedPlaylistAtom);
	const setIsPlaylistLoading = useSetAtom(setIsPlaylistLoadingActionAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);
	const removePlaylistSongs = useSetAtom(removePlaylistSongsActionAtom);
	const clearPlaylist = useSetAtom(clearPlaylistActionAtom);
	const dropDuplicatePlaylistSongs = useSetAtom(
		dropDuplicatePlaylistSongsActionAtom,
	);
	const reorderPlaylist = useSetAtom(reorderPlaylistActionAtom);

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_PLAYLIST,
		songTableKeyType,
	);

	// Similarity search
	const {
		isAdvancedSearchAvailable,
		setSimilaritySearchTargetSong,
		refreshSimilaritySearchSongs,
		setIsSimilaritySearchModalOpen,
	} = useSimilaritySearchContextMenuProps();

	const contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[] =
		selectedPlaylist === undefined
			? []
			: [
					{
						items: [
							getSongTableContextMenuAdd(
								songTableKeyType,
								notify,
								addSongsToQueue,
							),
							getSongTableContextMenuReplace(
								songTableKeyType,
								notify,
								replaceQueueWithSongs,
							),
						],
					},
					{
						items: [
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
					},
					{
						items: [
							getSongTableContextMenuAddToPlaylist(
								songTableKeyType,
								songsToAddToPlaylistRef,
								setIsPlaylistSelectModalOpen,
							),
						],
					},
					{
						items: [
							getSongTableContextMenuEditColumns(setIsColumnEditModalOpen),
						],
					},
				];
	if (isAdvancedSearchAvailable) {
		contextMenuSections.push({
			items: [
				getSongTableContextMenuSimilarSongs(
					setSimilaritySearchTargetSong,
					refreshSimilaritySearchSongs,
					setIsSimilaritySearchModalOpen,
				),
			],
		});
	}
	if (pluginContextMenuItems.length > 0) {
		contextMenuSections.push({
			items: pluginContextMenuItems,
		});
	}

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

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = clone(SongTableStateSchema, songTableState);
			newSongTableState.columns = updatedColumns;
			updateSongTableState({
				state: newSongTableState,
				mode: UpdateMode.PERSIST,
			});
		},
		[songTableState, updateSongTableState],
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

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_PLAYLIST_MAIN_PANE,
		songTableKeyType,
		songs,
		columns: songTableState.columns,
		isSortingEnabled: false,
		isReorderingEnabled: true,
		isGlobalFilterEnabled: true,
		contextMenuSections,
		isLoading,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
