import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAYLIST } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom as songTableStateAtom } from "../../../song_table/states/songTableState";
import { fetchPlaylistSongs } from "../../utils/playlistUtils";

import { selectedPlaylistAtom } from "./playlistAtom";

export const playlistSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	const selectedPlaylist = get(selectedPlaylistAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (selectedPlaylist === undefined) {
		return [];
	}

	return await fetchPlaylistSongs(mpdClient, profile, selectedPlaylist);
});

const playlistSongsSourceAtom = atomWithSync(playlistSongsAsyncAtom);

export const playlistSongsAtom = atom((get) => {
	const playlistSongs = get(playlistSongsSourceAtom);
	const songTableState = get(songTableStateAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_PLAYLIST ||
		playlistSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		playlistSongs,
		globalFilterTokens,
		songTableState.columns,
	);
});
