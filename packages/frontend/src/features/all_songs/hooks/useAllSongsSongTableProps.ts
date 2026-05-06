import { clone } from "@bufbuild/protobuf";
import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback, useEffect } from "react";
import { COMPONENT_ID_ALL_SONGS } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { useSimilaritySearchContextMenuProps } from "../../advanced_search";
import type { ContextMenuSection } from "../../context_menu";
import { mpdCapabilitiesAtom } from "../../mpd/states/atoms/mpdCapabilitiesAtom";
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
import { loadAllSongsFastActionAtom } from "../states/actions/loadAllSongsFastActionAtom";
import { setIsAllSongsLoadingActionAtom } from "../states/actions/setIsAllSongsLoadingActionAtom";
import { allVisibleSongsAtom } from "../states/atoms/allSongsAtom";
import {
	allSongsFastStateAtom,
	syncAllSongsFastStateEffectAtom,
} from "../states/atoms/allSongsFastStateAtom";
import {
	isAllSongsLoadingAtom,
	syncAllSongsLoadingEffectAtom,
} from "../states/atoms/allSongsUiAtom";

export function useAllSongsSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	useAtom(syncAllSongsLoadingEffectAtom);
	useAtom(syncAllSongsFastStateEffectAtom);
	const slowIsLoading = useAtomValue(isAllSongsLoadingAtom);
	const songs = useAtomValue(allVisibleSongsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const setIsAllSongsLoading = useSetAtom(setIsAllSongsLoadingActionAtom);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);

	const capabilities = useAtomValue(mpdCapabilitiesAtom);
	const fastState = useAtomValue(allSongsFastStateAtom);
	const loadAllSongsFast = useSetAtom(loadAllSongsFastActionAtom);

	// Kick off the progressive load on entering the page when the server
	// supports it. The loader is idempotent: re-entering with cached data is a
	// no-op because it short-circuits when `hasMore` is false.
	const isFast = capabilities.isMpd024OrLater;
	const fastIdle = !fastState.isLoading && fastState.hasMore;
	useEffect(() => {
		if (isFast && fastIdle) {
			loadAllSongsFast();
		}
	}, [isFast, fastIdle, loadAllSongsFast]);

	// In fast mode the spinner only blocks the table until the first chunk
	// arrives; subsequent chunks just append rows beneath the user.
	const isLoading = isFast
		? fastState.songs.length === 0 && (fastState.isLoading || fastState.hasMore)
		: slowIsLoading;

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_FULL_TEXT_SEARCH,
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
		throw new Error("Reorder songs must be disabled in AllSongs.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumn[]) => {
			if (songTableState === undefined) {
				return;
			}
			const newSongTableState = clone(SongTableStateSchema, songTableState);
			newSongTableState.columns = updatedColumns;
			await updateSongTableState({
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
		setIsAllSongsLoading(false);
	}, [setIsAllSongsLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_ALL_SONGS,
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
