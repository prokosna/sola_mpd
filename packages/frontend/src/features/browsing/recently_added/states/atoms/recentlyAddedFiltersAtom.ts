import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { allSongsAtom } from "../../../../all_songs/states/atoms/allSongsAtom";
import { filterStringsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdCapabilitiesAtom } from "../../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { localeCollatorAtom } from "../../../../settings/states/atoms/localeAtom";
import {
	composeBrowserFilterView,
	fetchBrowserFilterValues,
} from "../../../common/functions/browserFilter";
import {
	extractRecentlyAddedFastFilterValues,
	extractRecentlyAddedFilterValues,
	sortRecentlyAddedFilterValues,
} from "../../functions/recentlyAddedFiltering";
import { recentlyAddedFastStateAtom } from "./recentlyAddedFastStateAtom";
import { recentlyAddedSelectionAtom } from "./recentlyAddedSelectionAtom";
import { recentlyAddedStateAtom } from "./recentlyAddedStateAtom";

// The workspace's panel set only. Not exported; every consumer goes through
// recentlyAddedFiltersAtom below, which overlays the URL-derived selection.
export const recentlyAddedFilterTagsAtom = atom((get) => {
	const recentlyAddedState = get(recentlyAddedStateAtom);
	return recentlyAddedState?.filterTags;
});

// The composed atom every consumer reads: the server's tag structure with the
// URL-derived selection overlaid. Mirrors browserFiltersAtom.
export const recentlyAddedFiltersAtom = atom((get) => {
	const filterTags = get(recentlyAddedFilterTagsAtom);
	if (filterTags === undefined) {
		return undefined;
	}
	const selection = get(recentlyAddedSelectionAtom);
	return composeBrowserFilterView(filterTags, selection);
});

const allSongsSortedFilterValuesMapAtom = atom((get) => {
	const allSongs = get(allSongsAtom);
	if (allSongs === undefined) {
		return undefined;
	}
	return extractRecentlyAddedFilterValues(allSongs);
});

const recentlyAddedFilterValuesMapAsyncAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const filterTags = get(recentlyAddedFilterTagsAtom);
	const selection = get(recentlyAddedSelectionAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
	const collator = get(localeCollatorAtom);

	if (currentMpdProfile === undefined || filterTags === undefined) {
		return undefined;
	}

	return await fetchBrowserFilterValues(
		mpdClient,
		currentMpdProfile,
		filterTags,
		selection,
		collator,
	);
});

const recentlyAddedSortedFilterValuesMapAsyncAtom = atom(async (get) => {
	const sortedAllFilterValuesMap = get(allSongsSortedFilterValuesMapAtom);
	const browserFilterValuesMap = await get(
		recentlyAddedFilterValuesMapAsyncAtom,
	);

	if (
		sortedAllFilterValuesMap === undefined ||
		browserFilterValuesMap === undefined
	) {
		return new Map<Song_MetadataTag, string[]>();
	}

	return sortRecentlyAddedFilterValues(
		browserFilterValuesMap,
		sortedAllFilterValuesMap,
	);
});

const recentlyAddedSlowSortedFilterValuesMapAtom = atomWithSync(
	recentlyAddedSortedFilterValuesMapAsyncAtom,
);

const recentlyAddedFastSortedFilterValuesMapAtom = atom((get) => {
	const fastState = get(recentlyAddedFastStateAtom);
	return extractRecentlyAddedFastFilterValues(fastState.songs);
});

const recentlyAddedSortedFilterValuesMapAtom = atom((get) => {
	const capabilities = get(mpdCapabilitiesAtom);
	if (capabilities.isMpd024OrLater) {
		return get(recentlyAddedFastSortedFilterValuesMapAtom);
	}
	return get(recentlyAddedSlowSortedFilterValuesMapAtom);
});

export const filteredRecentlyAddedFilterValuesMapAtom = atom((get) => {
	const browserFilters = get(recentlyAddedFiltersAtom);
	const valuesMap = get(recentlyAddedSortedFilterValuesMapAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (pathname !== ROUTE_HOME_RECENTLY_ADDED || browserFilters === undefined) {
		return valuesMap;
	}

	const filteredMap = new Map(valuesMap);

	for (const browserFilter of browserFilters) {
		const values = filteredMap.get(browserFilter.tag);
		if (values === undefined) {
			continue;
		}
		filteredMap.set(
			browserFilter.tag,
			filterStringsByGlobalFilter(
				values,
				browserFilter.selectedValues,
				globalFilterTokens,
			),
		);
	}

	return filteredMap;
});
