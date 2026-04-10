import { clone } from "@bufbuild/protobuf";
import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import {
	type SongTableColumn,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type RefObject, useCallback } from "react";
import { COMPONENT_ID_TEXT_TO_MUSIC_SEARCH } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
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
	updateSongTableStateActionAtom,
	useHandleSongDoubleClick,
} from "../../song_table";
import { setIsTextToMusicSearchLoadingActionAtom } from "../states/actions/setIsTextToMusicSearchLoadingActionAtom";
import { textToMusicSearchSongsAtom } from "../states/atoms/textToMusicSearchAtom";
import { isTextToMusicSearchLoadingAtom } from "../states/atoms/textToMusicSearchUiAtom";
import { useSimilaritySearchContextMenuProps } from "./useSimilaritySearchContextMenuProps";

export function useTextToMusicSearchSongTableProps(
	songsToAddToPlaylistRef: RefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const isLoading = useAtomValue(isTextToMusicSearchLoadingAtom);
	const songs = useAtomValue(textToMusicSearchSongsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const setIsTextToMusicSearchLoading = useSetAtom(
		setIsTextToMusicSearchLoadingActionAtom,
	);
	const updateSongTableState = useSetAtom(updateSongTableStateActionAtom);
	const setSelectedSongs = useSetAtom(selectedSongsAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);

	// Plugin context menu items
	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_ADVANCED_SEARCH,
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
		throw new Error(
			"Reorder songs must be disabled in the Text-to-Music search.",
		);
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
		setIsTextToMusicSearchLoading(false);
	}, [setIsTextToMusicSearchLoading]);

	if (songs === undefined || songTableState === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_TEXT_TO_MUSIC_SEARCH,
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
