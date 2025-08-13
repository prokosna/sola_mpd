import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_RECENTLY_ADDED } from "../../../../const/component";
import { useNotification } from "../../../../lib/mantine/hooks/useNotification";
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
import { useRecentlyAddedSongsState } from "../states/recentlyAddedSongsState";
import {
	useIsRecentlyAddedLoadingState,
	useSetIsRecentlyAddedLoadingState,
} from "../states/recentlyAddedUiState";

/**
 * Get props for recently added song table.
 *
 * @param songsToAddToPlaylistRef Songs ref
 * @param setIsPlaylistSelectModalOpen Modal open setter
 * @param setIsColumnEditModalOpen Column edit setter
 * @returns Table props
 */
export function useRecentlyAddedSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsRecentlyAddedLoadingState();
	const songs = useRecentlyAddedSongsState();
	const songTableState = useSongTableState();
	const setIsRecentlyAddedLoading = useSetIsRecentlyAddedLoadingState();
	const updateSongTableState = useUpdateSongTableState();
	const setSelectedSongs = useSetSelectedSongsState();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_RECENTLY_ADDED,
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
		throw new Error("Reorder songs must be disabled in the recentlyAdded.");
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
		setIsRecentlyAddedLoading(false);
	}, [setIsRecentlyAddedLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_RECENTLY_ADDED,
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
