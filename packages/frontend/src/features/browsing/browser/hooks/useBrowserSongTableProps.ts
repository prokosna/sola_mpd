import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";
import { COMPONENT_ID_BROWSER } from "../../../../const/component";
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
import { setIsBrowserLoadingActionAtom } from "../states/actions/setIsBrowserLoadingActionAtom";
import { browserFiltersAtom } from "../states/atoms/browserFiltersAtom";
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

	useAtom(syncBrowserLoadingEffectAtom);
	const isLoading = useAtomValue(isBrowserLoadingAtom);
	const songs = useAtomValue(browserVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const filters = useAtomValue(browserFiltersAtom);
	const noRows = !hasBrowserFilterSelection(filters)
		? {
				isIdle: true,
				message: "Select items in the lists to show their songs.",
			}
		: { isIdle: false, message: "No songs match the selection." };
	const setIsBrowserLoading = useSetAtom(setIsBrowserLoadingActionAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_BROWSER,
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
		noRows,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
