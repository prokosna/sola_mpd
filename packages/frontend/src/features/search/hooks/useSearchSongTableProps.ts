import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_SEARCH_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	useHandleSongDoubleClick,
	useSetSelectedSongsState,
	useSongTableState,
} from "../../song_table";
import { useSearchSongTableColumnsState } from "../states/searchEditState";
import { useSearchSongsState } from "../states/searchSongsState";
import {
	useIsSearchLoadingState,
	useSetIsSearchLoadingState,
} from "../states/searchUiState";

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

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsSearchLoadingState();
	const songs = useSearchSongsState();
	const searchSongTableColumns = useSearchSongTableColumnsState();
	const songTableState = useSongTableState();
	const setIsSearchLoading = useSetIsSearchLoadingState();
	const setSelectedSongs = useSetSelectedSongsState();
	const handleSearchColumnsUpdated = useHandleSearchColumnsUpdated();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_SAVED_SEARCH,
		songTableKeyType,
	);

	const contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[] =
		[
			{
				items: [
					getSongTableContextMenuAdd(
						songTableKeyType,
						notify,
						profile,
						mpdClient,
					),
					getSongTableContextMenuReplace(
						songTableKeyType,
						notify,
						profile,
						mpdClient,
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

	const onSongDoubleClick = useHandleSongDoubleClick(mpdClient, profile);

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
