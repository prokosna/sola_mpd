import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_SEARCH_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
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
	useHandleSongDoubleClick,
} from "../../song_table";
import { setIsSearchLoadingActionAtom } from "../states/actions/setIsSearchLoadingActionAtom";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";
import { searchVisibleSongsAtom } from "../states/atoms/searchSongsAtom";
import { isSearchLoadingAtom } from "../states/atoms/searchUiAtom";
import { useHandleSearchColumnsUpdated } from "./useHandleSearchColumnsUpdated";

/**
 * Hook for search song table props.
 *
 * Manages state and callbacks for search table.
 *
 * @param songsToAddToPlaylistRef Ref for playlist songs
 * @param setIsPlaylistSelectModalOpen Playlist modal control
 * @param setIsColumnEditModalOpen Column modal control
 * @returns Table props or undefined
 */
export function useSearchSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const isLoading = useAtomValue(isSearchLoadingAtom);
	const songs = useAtomValue(searchVisibleSongsAtom);
	const searchSongTableColumns = useAtomValue(searchSongTableColumnsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const setIsSearchLoading = useSetAtom(setIsSearchLoadingActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);
	const handleSearchColumnsUpdated = useHandleSearchColumnsUpdated();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_SAVED_SEARCH,
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
		[
			{
				items: [
					getSongTableContextMenuAdd(songTableKeyType, notify, addSongsToQueue),
					getSongTableContextMenuReplace(
						songTableKeyType,
						notify,
						replaceQueueWithSongs,
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
				items: [getSongTableContextMenuEditColumns(setIsColumnEditModalOpen)],
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

	// Handlers
	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs is not supported in Search.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			handleSearchColumnsUpdated(updatedColumns);
		},
		[handleSearchColumnsUpdated],
	);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsSearchLoading(false);
	}, [setIsSearchLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_SEARCH_MAIN_PANE,
		songTableKeyType,
		songs,
		columns:
			searchSongTableColumns.length !== 0
				? searchSongTableColumns
				: songTableState.columns,
		isSortingEnabled: true,
		isReorderingEnabled: false,
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
