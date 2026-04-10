import { clone } from "@bufbuild/protobuf";
import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAY_QUEUE } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { useSimilaritySearchContextMenuProps } from "../../advanced_search";
import type { ContextMenuSection } from "../../context_menu";
import { usePluginContextMenuItems } from "../../plugin";
import {
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuSimilarSongs,
	getTargetSongsForContextMenu,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	selectedSongsAtom,
	songTableStateAtom,
	updateSongTableStateActionAtom,
} from "../../song_table";
import { clearQueueActionAtom } from "../states/actions/clearQueueActionAtom";
import { playSongByIdActionAtom } from "../states/actions/playSongByIdActionAtom";
import { removeQueueSongsActionAtom } from "../states/actions/removeQueueSongsActionAtom";
import { reorderQueueActionAtom } from "../states/actions/reorderQueueActionAtom";
import { setIsPlayQueueLoadingActionAtom } from "../states/actions/setIsPlayQueueLoadingActionAtom";
import { playQueueVisibleSongsAtom } from "../states/atoms/playQueueSongsAtom";
import {
	isPlayQueueLoadingAtom,
	syncPlayQueueLoadingEffectAtom,
} from "../states/atoms/playQueueUiAtom";

export function usePlayQueueSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.ID;

	const notify = useNotification();

	useAtomValue(syncPlayQueueLoadingEffectAtom);
	const isLoading = useAtomValue(isPlayQueueLoadingAtom);
	const songs = useAtomValue(playQueueVisibleSongsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const setIsPlayQueueLoading = useSetAtom(setIsPlayQueueLoadingActionAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const removeQueueSongs = useSetAtom(removeQueueSongsActionAtom);
	const clearQueue = useSetAtom(clearQueueActionAtom);
	const reorderQueue = useSetAtom(reorderQueueActionAtom);
	const playSongById = useSetAtom(playSongByIdActionAtom);

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_PLAY_QUEUE,
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
					{
						name: "Remove",
						onClick: async (params?: SongTableContextMenuItemParams) => {
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
							await removeQueueSongs(targetSongs);
							notify({
								status: "success",
								title: "Songs successfully removed",
								description: `${targetSongs.length} songs have been removed from the play queue.`,
							});
						},
					},
					{
						name: "Clear",
						onClick: async (params?: SongTableContextMenuItemParams) => {
							if (params === undefined) {
								return;
							}
							await clearQueue();
							notify({
								status: "success",
								title: "Songs successfully cleared",
								description: "All songs have been removed from the play queue.",
							});
						},
					},
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
	const onSongsReordered = useCallback(
		async (orderedSongs: Song[]) => {
			await reorderQueue(orderedSongs);
		},
		[reorderQueue],
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

	const onSongDoubleClick = useCallback(
		async (clickedSong: Song) => {
			await playSongById(clickedSong);
		},
		[playSongById],
	);

	const onLoadingCompleted = useCallback(async () => {
		setIsPlayQueueLoading(false);
	}, [setIsPlayQueueLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_PLAY_QUEUE,
		songTableKeyType: SongTableKeyType.ID,
		songs,
		columns: songTableState.columns,
		isSortingEnabled: false,
		isReorderingEnabled: true,
		isGlobalFilterEnabled: true,
		contextMenuSections,
		isLoading,
		scrollToPlayingSong: true,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
