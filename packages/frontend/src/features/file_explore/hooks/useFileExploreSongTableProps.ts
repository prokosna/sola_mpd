import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback } from "react";
import { COMPONENT_ID_FILE_EXPLORE_MAIN_PANE } from "../../../const/component";
import { useSimilarSongsContextMenuItems } from "../../advanced_search";
import { usePluginContextMenuItems } from "../../plugin";
import {
	SongTableKeyType,
	type SongTableProps,
	setSelectedSongsActionAtom,
	songTableColumnViewAtom,
	useHandleLibraryColumnsUpdated,
	useHandleSongDoubleClick,
	useSongTableContextMenuSections,
} from "../../song_table";
import { setIsFileExploreLoadingActionAtom } from "../states/actions/setIsFileExploreLoadingActionAtom";
import { selectedFileExploreFolderAtom } from "../states/atoms/fileExploreFoldersAtom";
import { fileExploreVisibleSongsAtom } from "../states/atoms/fileExploreSongsAtom";
import {
	isFileExploreLoadingAtom,
	syncFileExploreLoadingEffectAtom,
} from "../states/atoms/fileExploreUiAtom";

export function useFileExploreSongTableProps(
	songsToAddToPlaylistRef: MutableRefObject<Song[]>,
	setIsOpenPlaylistSelectModal: (open: boolean) => void,
	setIsOpenColumnEditModal: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	useAtom(syncFileExploreLoadingEffectAtom);
	const isLoading = useAtomValue(isFileExploreLoadingAtom);
	const songs = useAtomValue(fileExploreVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const selectedFolder = useAtomValue(selectedFileExploreFolderAtom);
	const noRows =
		selectedFolder === undefined
			? { isIdle: true, message: "Select a folder to show its songs." }
			: { isIdle: false, message: "This folder has no songs." };
	const setIsFileExploreLoading = useSetAtom(setIsFileExploreLoadingActionAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_FILE_EXPLORE,
		songTableKeyType,
	);
	const similarSongsContextMenuItems = useSimilarSongsContextMenuItems();

	const contextMenuSections = useSongTableContextMenuSections({
		songTableKeyType,
		hasQueueItems: true,
		sourceSections: [],
		extraSections: [similarSongsContextMenuItems, pluginContextMenuItems],
		songsToAddToPlaylistRef,
		setIsPlaylistSelectModalOpen: setIsOpenPlaylistSelectModal,
		setIsColumnEditModalOpen: setIsOpenColumnEditModal,
	});

	const onSongsReordered = useCallback(async (_orderedSongs: Song[]) => {
		throw new Error("Reorder songs shouldn't be supported in FileExplore.");
	}, []);

	const onSongsSelected = useCallback(
		async (selectedSongs: Song[]) => {
			setSelectedSongs(selectedSongs);
		},
		[setSelectedSongs],
	);

	const onSongDoubleClick = useHandleSongDoubleClick();

	const onLoadingCompleted = useCallback(async () => {
		setIsFileExploreLoading(false);
	}, [setIsFileExploreLoading]);

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_FILE_EXPLORE_MAIN_PANE,
		songTableKeyType,
		songs,
		columns,
		isSortingEnabled: false,
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
