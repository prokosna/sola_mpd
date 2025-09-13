import { clone } from "@bufbuild/protobuf";
import { Plugin_PluginType } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import { type RefObject, useCallback } from "react";
import { COMPONENT_ID_SIMILARITY_SEARCH } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import type { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { usePluginContextMenuItems } from "../../plugin";
import { useCurrentMpdProfileState } from "../../profile";
import {
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	useHandleSongDoubleClick,
	useSetSelectedSongsState,
	useSongTableState,
	useUpdateSongTableState,
} from "../../song_table";
import { useSimilaritySearchSongsState } from "../states/similaritySearchState";
import { useIsSimilaritySearchLoadingState } from "../states/similaritySearchUiState";

export function useSimilaritySearchSongTableProps(
	songsToAddToPlaylistRef: RefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const isLoading = useIsSimilaritySearchLoadingState();
	const songs = useSimilaritySearchSongsState();
	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();
	const setSelectedSongs = useSetSelectedSongsState();

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_ADVANCED_SEARCH,
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
		throw new Error("Reorder songs must be disabled in the similarity search.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = clone(SongTableStateSchema, songTableState);
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

	const onLoadingCompleted = async () => {};

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_SIMILARITY_SEARCH,
		songTableKeyType,
		songs,
		columns: songTableState.columns,
		isSortingEnabled: false,
		isReorderingEnabled: false,
		isGlobalFilterEnabled: false,
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
