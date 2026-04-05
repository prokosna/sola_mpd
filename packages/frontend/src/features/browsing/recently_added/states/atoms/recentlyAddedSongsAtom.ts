import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom } from "../../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../../../song_table/states/songTableState";
import { fetchBrowserSongs } from "../../../common/utils/browserSongsUtils";
import { recentlyAddedBrowserFiltersAtom } from "./recentlyAddedFiltersAtom";

export const recentlyAddedSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const currentMpdProfile = get(currentMpdProfileSyncAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	return await fetchBrowserSongs(mpdClient, currentMpdProfile, browserFilters);
});

const recentlyAddedSongsAtom = atomWithSync(recentlyAddedSongsAsyncAtom);

export const recentlyAddedVisibleSongsAtom = atom((get) => {
	const recentlyAddedSongs = get(recentlyAddedSongsAtom);
	const songTableState = get(songTableStateSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_RECENTLY_ADDED ||
		recentlyAddedSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		recentlyAddedSongs,
		globalFilterTokens,
		songTableState.columns,
	);
});
