import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_BROWSER } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { songTableStateAtom } from "../../../../song_table/states/atoms/songTableAtom";
import { fetchBrowserSongs } from "../../../common/functions/browserSongs";
import { browserFiltersAtom } from "./browserFiltersAtom";

export const browserSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
	const browserFilters = get(browserFiltersAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	return await fetchBrowserSongs(mpdClient, currentMpdProfile, browserFilters);
});

const browserSongsAtom = atomWithSync(browserSongsAsyncAtom);

export const browserVisibleSongsAtom = atom((get) => {
	const browserSongs = get(browserSongsAtom);
	const songTableState = get(songTableStateAtom);
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
