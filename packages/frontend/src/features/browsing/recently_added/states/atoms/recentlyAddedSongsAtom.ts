import {
	convertSongMetadataValueToString,
	getSongMetadataAsString,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdCapabilitiesAtom } from "../../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { songTableStateAtom } from "../../../../song_table/states/atoms/songTableAtom";
import { fetchBrowserSongs } from "../../../common/functions/browserSongs";
import { recentlyAddedFastStateAtom } from "./recentlyAddedFastStateAtom";
import { recentlyAddedBrowserFiltersAtom } from "./recentlyAddedFiltersAtom";

export const recentlyAddedSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	return await fetchBrowserSongs(mpdClient, currentMpdProfile, browserFilters);
});

const recentlyAddedSlowSongsAtom = atomWithSync(recentlyAddedSongsAsyncAtom);

const recentlyAddedFastSongsAtom = atom((get) => {
	const fastState = get(recentlyAddedFastStateAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersAtom);
	if (browserFilters === undefined) {
		return undefined;
	}
	const hasSelection = browserFilters.some(
		(filter) => filter.selectedValues.length > 0,
	);
	if (!hasSelection) {
		return [];
	}
	return fastState.songs.filter((song) =>
		browserFilters.every((filter) => {
			if (filter.selectedValues.length === 0) {
				return true;
			}
			const songValue = getSongMetadataAsString(song, filter.tag);
			return filter.selectedValues.some(
				(value) => convertSongMetadataValueToString(value) === songValue,
			);
		}),
	);
});

const recentlyAddedSongsAtom = atom((get) => {
	const capabilities = get(mpdCapabilitiesAtom);
	if (capabilities.supportsAddedSince) {
		return get(recentlyAddedFastSongsAtom);
	}
	return get(recentlyAddedSlowSongsAtom);
});

export const recentlyAddedVisibleSongsAtom = atom((get) => {
	const recentlyAddedSongs = get(recentlyAddedSongsAtom);
	const songTableState = get(songTableStateAtom);
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
