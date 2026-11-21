import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";
import { COMPONENT_ID_RECENTLY_ADDED } from "../../../../const/component";
import { useSimilarSongsContextMenuItems } from "../../../advanced_search";
import { usePluginContextMenuItems } from "../../../plugin";
import {
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	songTableColumnViewAtom,
	useHandleLibraryColumnsUpdated,
	useHandleSongDoubleClick,
	useSongTableContextMenuSections,
} from "../../../song_table";
import { hasBrowserFilterSelection } from "../../common/functions/browserFilter";
import { setIsRecentlyAddedLoadingActionAtom } from "../states/actions/setIsRecentlyAddedLoadingActionAtom";
import { recentlyAddedFiltersAtom } from "../states/atoms/recentlyAddedFiltersAtom";
import { recentlyAddedVisibleSongsAtom } from "../states/atoms/recentlyAddedSongsAtom";
import {
	isRecentlyAddedLoadingAtom,
	syncRecentlyAddedLoadingEffectAtom,
} from "../states/atoms/recentlyAddedUiAtom";

export function useRecentlyAddedSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	useAtomValue(syncRecentlyAddedLoadingEffectAtom);
	const isLoading = useAtomValue(isRecentlyAddedLoadingAtom);
	const songs = useAtomValue(recentlyAddedVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const filters = useAtomValue(recentlyAddedFiltersAtom);
	const noRows = !hasBrowserFilterSelection(filters)
		? {
				isIdle: true,
				message: "Select items in the lists to show their songs.",
			}
		: { isIdle: false, message: "No songs match the selection." };
	const setIsRecentlyAddedLoading = useSetAtom(
		setIsRecentlyAddedLoadingActionAtom,
	);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_RECENTLY_ADDED,
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
	});

	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs must be disabled in the recentlyAdded.");
	}, []);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsRecentlyAddedLoading(false);
	}, [setIsRecentlyAddedLoading]);

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_RECENTLY_ADDED,
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
