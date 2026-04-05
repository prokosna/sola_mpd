import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_ALL_SONGS } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom as songTableStateAtom } from "../../../song_table/states/songTableState";
import { fetchAllSongs } from "../../utils/allSongsUtils";

export const allSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchAllSongs(mpdClient, profile);
});

export const allSongsAtom = atomWithSync(allSongsAsyncAtom);

export const allVisibleSongsAtom = atom((get) => {
	const allSongs = get(allSongsAtom);
	const songTableState = get(songTableStateAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_ALL_SONGS ||
		allSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		allSongs,
		globalFilterTokens,
		songTableState.columns,
	);
});
