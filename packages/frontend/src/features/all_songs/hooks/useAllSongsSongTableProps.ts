import { Plugin_PluginType } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { type MutableRefObject, useCallback, useEffect, useRef } from "react";
import { COMPONENT_ID_ALL_SONGS } from "../../../const/component";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useSimilarSongsContextMenuItems } from "../../advanced_search";
import { mpdCapabilitiesAtom } from "../../mpd/states/atoms/mpdCapabilitiesAtom";
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
import { loadAllSongsFastActionAtom } from "../states/actions/loadAllSongsFastActionAtom";
import { setIsAllSongsLoadingActionAtom } from "../states/actions/setIsAllSongsLoadingActionAtom";
import { allVisibleSongsAtom } from "../states/atoms/allSongsAtom";
import { allSongsFastStateAtom } from "../states/atoms/allSongsFastStateAtom";
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

	useAtomValue(syncAllSongsLoadingEffectAtom);
	const slowIsLoading = useAtomValue(isAllSongsLoadingAtom);
	const songs = useAtomValue(allVisibleSongsAtom);
	const columns = useAtomValue(songTableColumnViewAtom);
	const noRows = {
		isIdle: false,
		message: "The library has no songs. Update the database to scan it.",
	};
	const setIsAllSongsLoading = useSetAtom(setIsAllSongsLoadingActionAtom);
	const onColumnsUpdated = useHandleLibraryColumnsUpdated();
	const setSelectedSongs = useSetAtom(setSelectedSongsActionAtom);

	const capabilities = useAtomValue(mpdCapabilitiesAtom);
	const fastState = useAtomValue(allSongsFastStateAtom);
	const loadAllSongsFast = useSetAtom(loadAllSongsFastActionAtom);

	// Kick off the progressive load on entering the page when the server
	// supports it. The loader is idempotent: re-entering with cached data is a
	// no-op because it short-circuits when `hasMore` is false.
	const isFast = capabilities.isMpd024OrLater;
	const hasAttemptedErrorRetryRef = useRef(false);
	const canRetryStaleError =
		fastState.error !== undefined && !hasAttemptedErrorRetryRef.current;
	const fastIdle =
		!fastState.isLoading &&
		fastState.hasMore &&
		(fastState.error === undefined || canRetryStaleError);
	useEffect(() => {
		if (isFast && fastIdle) {
			if (fastState.error !== undefined) {
				hasAttemptedErrorRetryRef.current = true;
			}
			loadAllSongsFast().catch((err) => {
				hasAttemptedErrorRetryRef.current = true;
				console.error("Failed to load all songs:", err);
				notify({
					status: "error",
					title: "Failed to load songs",
					description: err instanceof Error ? err.message : String(err),
				});
			});
		}
	}, [isFast, fastIdle, fastState.error, loadAllSongsFast, notify]);

	// In fast mode the spinner only blocks the table until the first chunk
	// arrives; subsequent chunks just append rows beneath the user.
	const isLoading = isFast
		? fastState.songs.length === 0 &&
			(fastState.isLoading ||
				(fastState.hasMore && fastState.error === undefined))
		: slowIsLoading;

	const pluginContextMenuItems = usePluginContextMenuItems(
		Plugin_PluginType.ON_FULL_TEXT_SEARCH,
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
		throw new Error("Reorder songs must be disabled in AllSongs.");
	}, []);

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

	if (songs === undefined || columns === undefined) {
		return undefined;
	}

	return {
		id: COMPONENT_ID_ALL_SONGS,
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
