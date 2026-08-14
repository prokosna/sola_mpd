import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type RefObject, useCallback } from "react";
import { COMPONENT_ID_SIMILARITY_SEARCH } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import type { ContextMenuSection } from "../../context_menu";
import { usePluginContextMenuItems } from "../../plugin";
import {
	addSongsToQueueActionAtom,
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	replaceQueueWithSongsActionAtom,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	songTableColumnViewAtom,
	useHandleLibraryColumnsUpdated,
	useHandleSongDoubleClick,
} from "../../song_table";
import { similaritySearchSongsAtom } from "../states/atoms/similaritySearchAtom";
import { isSimilaritySearchLoadingAtom } from "../states/atoms/similaritySearchUiAtom";

export function useSimilaritySearchSongTableProps(
	songsToAddToPlaylistRef: RefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	const isLoading = useAtomValue(isSimilaritySearchLoadingAtom);
	const songs = useAtomValue(similaritySearchSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_ADVANCED_SEARCH,
		songTableKeyType,
	);

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
	if (pluginContextMenuItems.length > 0) {
		contextMenuSections.push({
			items: pluginContextMenuItems,
		});
	}

	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs must be disabled in the similarity search.");
	}, []);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = async () => {};

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_SIMILARITY_SEARCH,
		songTableKeyType,
		songs,
		columns,
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
