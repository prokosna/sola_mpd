import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_PLAY_QUEUE } from "../../../const/component";
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
	convertOrderingToOperations,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getTargetSongsForContextMenu,
	useSetSelectedSongsState,
	useSongTableState,
	useUpdateSongTableState,
} from "../../song_table";
import { usePlayQueueSongsState } from "../states/playQueueSongsState";
import {
	useIsPlayQueueLoadingState,
	useSetIsPlayQueueLoadingState,
} from "../states/playQueueUiState";

/**
 * Provides configuration and handlers for the play queue song table.
 *
 * Manages context menu actions for queue manipulation, playlist
 * integration, and column customization. Handles song selection,
 * loading states, and plugin-specific features through MPD client
 * and table state coordination.
 *
 * Requires MPD client and profile setup for proper operation.
 */
export function usePlayQueueSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.ID;

	const notify = useNotification();

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsPlayQueueLoadingState();
	const songs = usePlayQueueSongsState();
	const songTableState = useSongTableState();
	const setIsPlayQueueLoading = useSetIsPlayQueueLoadingState();
	const updateSongTableState = useUpdateSongTableState();
	const setSelectedSongs = useSetSelectedSongsState();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_PLAY_QUEUE,
		songTableKeyType,
	);

	const contextMenuSections: ContextMenuSection<SongTableContextMenuItemParams>[] =
		[
			{
				items: [
					{
						name: "Remove",
						onClick: async (params?: SongTableContextMenuItemParams) => {
							if (
								params === undefined ||
								mpdClient === undefined ||
								profile === undefined
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
							const commands = targetSongs.map(
								(song) =>
									new MpdRequest({
										profile,
										command: {
											case: "delete",
											value: {
												target: {
													case: "id",
													value: getSongMetadataAsString(
														song,
														Song_MetadataTag.ID,
													),
												},
											},
										},
									}),
							);
							await mpdClient.commandBulk(commands);
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
							if (
								params === undefined ||
								mpdClient === undefined ||
								profile === undefined
							) {
								return;
							}
							await mpdClient.command(
								new MpdRequest({
									profile,
									command: {
										case: "clear",
										value: {},
									},
								}),
							);
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
	if (pluginContextMenuItems.length > 0) {
		contextMenuSections.push({
			items: pluginContextMenuItems,
		});
	}

	// Handlers
	const onSongsReordered = useCallback(
		async (orderedSongs: Song[]) => {
			if (
				profile === undefined ||
				songs === undefined ||
				mpdClient === undefined
			) {
				return;
			}
			const ops = convertOrderingToOperations(
				songs,
				orderedSongs,
				songTableKeyType,
			);
			const commands = ops.map(
				(op) =>
					new MpdRequest({
						profile,
						command: {
							case: "move",
							value: {
								from: { case: "fromId", value: op.id },
								to: String(op.to),
							},
						},
					}),
			);
			await mpdClient.commandBulk(commands);
		},
		[mpdClient, profile, songTableKeyType, songs],
	);

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

	const onSongDoubleClick = useCallback(
		async (clickedSong: Song) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}
			await mpdClient.command(
				new MpdRequest({
					profile,
					command: {
						case: "play",
						value: {
							target: {
								case: "id",
								value: getSongMetadataAsString(
									clickedSong,
									Song_MetadataTag.ID,
								),
							},
						},
					},
				}),
			);
		},
		[mpdClient, profile],
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
