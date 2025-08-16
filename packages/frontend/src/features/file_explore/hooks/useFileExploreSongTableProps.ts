import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_FILE_EXPLORE_MAIN_PANE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
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
	useUpdateSongTableState,
} from "../../song_table";
import { useFileExploreSongsState } from "../states/fileExploreSongsState";
import {
	useIsFileExploreLoadingState,
	useSetIsFileExploreLoadingState,
} from "../states/fileExploreUiState";

/**
 * Hook for managing file explorer song table functionality.
 *
 * Features:
 * - Queue and playlist management
 * - Plugin integration
 * - Column customization
 * - Selection and interaction handling
 * - Loading state management
 *
 * @param songsToAddToPlaylistRef - Reference for playlist operations
 * @param setIsOpenPlaylistSelectModal - Playlist modal control
 * @param setIsOpenColumnEditModal - Column edit modal control
 * @returns Song table properties or undefined if data not ready
 */
export function useFileExploreSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsOpenPlaylistSelectModal: (open: boolean) => void,
	setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsFileExploreLoadingState();
	const songs = useFileExploreSongsState();
	const songTableState = useSongTableState();
	const setIsFileExploreLoading = useSetIsFileExploreLoadingState();
	const updateSongTableState = useUpdateSongTableState();
	const setSelectedSongs = useSetSelectedSongsState();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_FILE_EXPLORE,
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
						setIsOpenPlaylistSelectModal,
					),
				],
			},
			{
				items: [getSongTableContextMenuEditColumns(setIsOpenColumnEditModal)],
			},
		];
	if (pluginContextMenuItems.length > 0) {
		contextMenuSections.push({
			items: pluginContextMenuItems,
		});
	}

	// Handlers
	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs shouldn't be supported in FileExplore.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = songTableState.clone();
			newSongTableState.columns = updatedColumns;
			updateSongTableState(newSongTableState, UpdateMode.PERSIST);
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
		setIsFileExploreLoading(false);
	}, [setIsFileExploreLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_FILE_EXPLORE_MAIN_PANE,
		songTableKeyType,
		songs,
		columns: songTableState.columns,
		isSortingEnabled: false,
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
