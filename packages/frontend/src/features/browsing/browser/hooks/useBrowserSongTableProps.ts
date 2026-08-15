import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";
import { COMPONENT_ID_BROWSER } from "../../../../const/component";
import { useNotification } from "../../../../lib/mantine/hooks/useNotification";
import { useSimilaritySearchContextMenuProps } from "../../../advanced_search";
import type { ContextMenuSection } from "../../../context_menu";
import { usePluginContextMenuItems } from "../../../plugin";
import {
	addSongsToQueueActionAtom,
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuResetLayout,
	getSongTableContextMenuSimilarSongs,
	replaceQueueWithSongsActionAtom,
	resetSongTableLayoutActionAtom,
	type SongTableContextMenuItemParams,
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	songTableColumnViewAtom,
	useHandleLibraryColumnsUpdated,
	useHandleSongDoubleClick,
} from "../../../song_table";
import { setIsBrowserLoadingActionAtom } from "../states/actions/setIsBrowserLoadingActionAtom";
import { browserVisibleSongsAtom } from "../states/atoms/browserSongsAtom";
import {
	isBrowserLoadingAtom,
	syncBrowserLoadingEffectAtom,
} from "../states/atoms/browserUiAtom";

export function useBrowserSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const notify = useNotification();

	useAtom(syncBrowserLoadingEffectAtom);
	const isLoading = useAtomValue(isBrowserLoadingAtom);
	const songs = useAtomValue(browserVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const setIsBrowserLoading = useSetAtom(setIsBrowserLoadingActionAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);
	const addSongsToQueue = useSetAtom(addSongsToQueueActionAtom);
	const replaceQueueWithSongs = useSetAtom(replaceQueueWithSongsActionAtom);
	const resetSongTableLayout = useSetAtom(resetSongTableLayoutActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_BROWSER,
		songTableKeyType,
	);

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
				items: [
					getSongTableContextMenuEditColumns(setIsColumnEditModalOpen),
					getSongTableContextMenuResetLayout(resetSongTableLayout),
				],
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

	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs must be disabled in the browser.");
	}, []);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsBrowserLoading(false);
	}, [setIsBrowserLoading]);

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_BROWSER,
		songTableKeyType,
		songs,
		columns,
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
