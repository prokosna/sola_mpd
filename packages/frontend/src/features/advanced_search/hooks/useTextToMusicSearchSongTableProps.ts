import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type RefObject, useCallback } from "react";
import { COMPONENT_ID_TEXT_TO_MUSIC_SEARCH } from "../../../const/component";
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
import { setIsTextToMusicSearchLoadingActionAtom } from "../states/actions/setIsTextToMusicSearchLoadingActionAtom";
import {
	textToMusicSearchQueryAtom,
	textToMusicSearchSongsAtom,
} from "../states/atoms/textToMusicSearchAtom";
import { isTextToMusicSearchLoadingAtom } from "../states/atoms/textToMusicSearchUiAtom";
import { useSimilarSongsContextMenuItems } from "./useSimilarSongsContextMenuItems";

export function useTextToMusicSearchSongTableProps(
	songsToAddToPlaylistRef: RefObject<Song[]>,
	setIsPlaylistSelectModalOpen: (open: boolean) => void,
	setIsColumnEditModalOpen: (open: boolean) => void,
): SongTableProps | undefined {
	const songTableKeyType = SongTableKeyType.PATH;

	const isLoading = useAtomValue(isTextToMusicSearchLoadingAtom);
	const result = useAtomValue(textToMusicSearchSongsAtom);
	const songs =
		result === undefined
			? undefined
			: result.kind === "songs"
				? result.songs
				: [];
	const columns = useAtomValue(songTableColumnViewAtom);
	const query = useAtomValue(textToMusicSearchQueryAtom);
	const noRows =
		query === ""
			? {
					isIdle: true,
					message: "Describe the music you want in English to show songs.",
				}
			: { isIdle: false, message: "No songs match this description." };
	const setIsTextToMusicSearchLoading = useSetAtom(
		setIsTextToMusicSearchLoadingActionAtom,
	);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_ADVANCED_SEARCH,
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
		throw new Error(
			"Reorder songs must be disabled in the Text-to-Music search.",
		);
	}, []);

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

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_TEXT_TO_MUSIC_SEARCH,
		songTableKeyType,
		songs,
		columns,
		isSortingEnabled: false,
		isReorderingEnabled: false,
		isGlobalFilterEnabled: false,
		contextMenuSections,
		isLoading,
		noRows,
		scrollToPlayingSong: true,
		onSongsReordered,
		onColumnsUpdated,
		onSongsSelected,
		onSongDoubleClick,
		onLoadingCompleted,
	};
}
