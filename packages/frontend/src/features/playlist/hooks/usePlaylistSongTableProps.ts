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
import { mpdClientAtom } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { currentMpdProfileAtom } from "../../profile";
import {
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuSimilarSongs,
	getTargetSongsForContextMenu,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	selectedSongsAtom,
	songTableStateAtom,
	updateSongTableStateActionAtom,
	useHandleSongDoubleClick,
} from "../../song_table";
import {
	buildClearPlaylistCommands,
	buildDropDuplicatePlaylistSongsCommands,
	buildRemovePlaylistSongsCommands,
	buildReorderPlaylistCommands,
} from "../functions/playlistSongOperations";
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

	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	useAtomValue(syncPlaylistLoadingEffectAtom);
	const isLoading = useAtomValue(isPlaylistLoadingAtom);
	const songs = useAtomValue(playlistVisibleSongsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const selectedPlaylist = useAtomValue(selectedPlaylistAtom);
	const setIsPlaylistLoading = useSetAtom(setIsPlaylistLoadingActionAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);

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
					{
						name: "Remove",
						onClick: async (params?: SongTableContextMenuItemParams) => {
							if (
								params === undefined ||
								mpdClient === undefined ||
								profile === undefined ||
								selectedPlaylist === undefined
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
							const commands = buildRemovePlaylistSongsCommands(
								targetSongs,
								params.sortedSongs,
								selectedPlaylist.name,
								profile,
								songTableKeyType,
							);
							await mpdClient.commandBulk(commands);
							notify({
								status: "success",
								title: "Songs successfully removed",
								description: `${targetSongs.length} songs have been removed from the playlist "${selectedPlaylist.name}".`,
							});
						},
					},
					{
						name: "Clear",
						onClick: async (params?: SongTableContextMenuItemParams) => {
							if (
								params === undefined ||
								mpdClient === undefined ||
								profile === undefined ||
								selectedPlaylist === undefined
							) {
								return;
							}
							const commands = buildClearPlaylistCommands(
								selectedPlaylist.name,
								profile,
							);
							await mpdClient.commandBulk(commands);
							notify({
								status: "success",
								title: "Songs successfully cleared",
								description: `All songs have been removed from the playlist "${selectedPlaylist.name}".`,
							});
						},
					},
					{
						name: "Drop Duplicates",
						onClick: async (params?: SongTableContextMenuItemParams) => {
							if (
								params === undefined ||
								mpdClient === undefined ||
								profile === undefined ||
								selectedPlaylist === undefined
							) {
								return;
							}
							if (params.sortedSongs.length === 0) {
								return;
							}
							const { commands, duplicateCount } =
								buildDropDuplicatePlaylistSongsCommands(
									params.sortedSongs,
									selectedPlaylist.name,
									profile,
								);
							if (duplicateCount === 0) {
								notify({
									status: "info",
									title: "No duplicated songs",
									description: "There are no duplicated songs to remove.",
								});
								return;
							}
							await mpdClient.commandBulk(commands);
							notify({
								status: "success",
								title: "Songs successfully removed",
								description: `${duplicateCount} duplicated songs have been removed from the playlist "${selectedPlaylist.name}".`,
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

	const onSongsReordered = useCallback(
		async (orderedSongs: Song[]) => {
			if (
				profile === undefined ||
				songs === undefined ||
				mpdClient === undefined ||
				selectedPlaylist === undefined
			) {
				return;
			}
			const commands = buildReorderPlaylistCommands(
				orderedSongs,
				selectedPlaylist.name,
				profile,
			);
			await mpdClient.commandBulk(commands);
		},
		[mpdClient, profile, selectedPlaylist, songs],
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

	const onSongDoubleClick = useHandleSongDoubleClick(mpdClient, profile);

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
