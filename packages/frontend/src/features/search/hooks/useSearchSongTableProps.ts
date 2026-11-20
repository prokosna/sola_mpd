import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";

import { COMPONENT_ID_SEARCH_MAIN_PANE } from "../../../const/component";
import { useSimilarSongsContextMenuItems } from "../../advanced_search";
import { usePluginContextMenuItems } from "../../plugin";
import {
	type SongTableColumnView,
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	useHandleSongDoubleClick,
	useSongTableContextMenuSections,
} from "../../song_table";
import { resetSearchLayoutActionAtom } from "../states/actions/resetSearchLayoutActionAtom";
import { setIsSearchLoadingActionAtom } from "../states/actions/setIsSearchLoadingActionAtom";
import { searchColumnViewAtom } from "../states/atoms/searchColumnViewAtom";
import {
	searchVisibleSongsAtom,
	targetSearchAtom,
} from "../states/atoms/searchSongsAtom";
import { isSearchLoadingAtom } from "../states/atoms/searchUiAtom";
import { useHandleSearchColumnsUpdated } from "./useHandleSearchColumnsUpdated";

export function useSearchSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const isLoading = useAtomValue(isSearchLoadingAtom);
	const songs = useAtomValue(searchVisibleSongsAtom);
	const columns = useAtomValue(searchColumnViewAtom);
	const targetSearch = useAtomValue(targetSearchAtom);
	const noRows =
		targetSearch === undefined
			? {
					isIdle: true,
					message: "Run a search or pick a saved search to show songs.",
				}
			: { isIdle: false, message: "No songs match this search." };
	const setIsSearchLoading = useSetAtom(setIsSearchLoadingActionAtom);
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);
	const resetSearchLayout = useSetAtom(resetSearchLayoutActionAtom);
	const handleSearchColumnsUpdated = useHandleSearchColumnsUpdated();

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_SAVED_SEARCH,
		songTableKeyType,
	);
	const similarSongsContextMenuItems = useSimilarSongsContextMenuItems();

	const contextMenuSections = useSongTableContextMenuSections({
		songTableKeyType,
		hasQueueItems: true,
		sourceSections: [],
		extraSections: [similarSongsContextMenuItems, pluginContextMenuItems],
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen,
		setIsColumnEditModalOpen,
		resetLayout: resetSearchLayout,
	});

	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs is not supported in Search.");
	}, []);

	const onColumnsUpdated = useCallback(
		async (updatedColumns: SongTableColumnView[]) => {
			handleSearchColumnsUpdated(updatedColumns);
		},
		[handleSearchColumnsUpdated],
	);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsSearchLoading(false);
	}, [setIsSearchLoading]);

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_SEARCH_MAIN_PANE,
		songTableKeyType,
		songs,
		columns,
		isSortingEnabled: true,
		isReorderingEnabled: false,
		isGlobalFilterEnabled: true,
		contextMenuSections,
		isLoading,
		noRows,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
