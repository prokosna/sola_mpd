import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_BROWSER } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom } from "../../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../../../song_table/states/songTableState";
import { fetchBrowserSongs } from "../../../common/utils/browserSongsUtils";
import { browserFiltersAtom } from "./browserFiltersAtom";

export const browserSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const currentMpdProfile = get(currentMpdProfileSyncAtom);
	const browserFilters = get(browserFiltersAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	return await fetchBrowserSongs(mpdClient, currentMpdProfile, browserFilters);
});

const browserSongsAtom = atomWithSync(browserSongsAsyncAtom);

export const browserVisibleSongsAtom = atom((get) => {
	const browserSongs = get(browserSongsAtom);
	const songTableState = get(songTableStateSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_BROWSER ||
		browserSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		browserSongs,
		globalFilterTokens,
		songTableState.columns,
	);
});
