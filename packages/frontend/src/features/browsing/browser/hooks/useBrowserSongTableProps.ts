import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_BROWSER } from "../../../../const/component";
import { useNotification } from "../../../../lib/chakra/hooks/useNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import type { ContextMenuSection } from "../../../context_menu";
import { useMpdClientState } from "../../../mpd";
import { usePluginContextMenuItems } from "../../../plugin";
import { useCurrentMpdProfileState } from "../../../profile";
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
	useUpdateSongTableState,
} from "../../../song_table";
import { useBrowserSongsState } from "../states/browserSongsState";
import {
	useIsBrowserLoadingState,
	useSetIsBrowserLoadingState,
} from "../states/browserUiState";

/**
 * Custom hook for managing browser song table functionality.
 *
 * Features:
 * - Queue and playlist management
 * - Plugin integration
 * - Column customization
 * - Selection and interaction handling
 * - Loading state management
 *
 * @param songsToAddToPlaylistRef - Reference for playlist operations
 * @param setIsPlaylistSelectModalOpen - Playlist modal control
 * @param setIsColumnEditModalOpen - Column edit modal control
 * @returns Song table properties or undefined if data not ready
 */
export function useBrowserSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsBrowserLoadingState();
	const songs = useBrowserSongsState();
	const songTableState = useSongTableState();
	const setIsBrowserLoading = useSetIsBrowserLoadingState();
	const updateSongTableState = useUpdateSongTableState();
	const setSelectedSongs = useSetSelectedSongsState();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_BROWSER,
		songTableKeyType,
	);

	// Context menu
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
		throw new Error("Reorder songs must be disabled in the browser.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = songTableState.clone();
			newSongTableState.columns = updatedColumns;
			await updateSongTableState(newSongTableState, UpdateMode.PERSIST);
		},
		[songTableState, updateSongTableState],
	);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick(mpdClient, profile);

	const onLoadingCompleted = useCallback(async () => {
		setIsBrowserLoading(false);
	}, [setIsBrowserLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_BROWSER,
		songTableKeyType,
		songs,
		columns: songTableState.columns,
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
