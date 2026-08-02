import { create } from "@bufbuild/protobuf";
import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import { BrowserFilterSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
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
	applyBrowserSelectionToFilters,
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

const recentlyAddedFiltersAtom = atom((get) => {
	const recentlyAddedState = get(recentlyAddedStateAtom);
	return recentlyAddedState?.filters;
});

// Private: the server's tag configuration only (Workspace). Selection is a
// navigation position and now lives in the URL — see
// docs/design/state-scoping.md §6.2/§14.3(b). Not exported; every consumer
// must go through recentlyAddedBrowserFiltersAtom below.
const recentlyAddedStructuralFiltersAtom = atom((get) => {
	const recentlyAddedFilters = get(recentlyAddedFiltersAtom);
	return recentlyAddedFilters?.map((filter, index) =>
		create(BrowserFilterSchema, {
			tag: filter.tag,
			selectedValues: [],
			order: index,
			selectedOrder: -1,
		}),
	);
});

// The composed atom every existing consumer reads. Exported name and shape
// are unchanged from before the split.
export const recentlyAddedBrowserFiltersAtom = atom((get) => {
	const structuralFilters = get(recentlyAddedStructuralFiltersAtom);
	if (structuralFilters === undefined) {
		return undefined;
	}
	const selection = get(recentlyAddedSelectionAtom);
	return applyBrowserSelectionToFilters(structuralFilters, selection);
});

const allSongsSortedFilterValuesMapAtom = atom((get) => {
	const allSongs = get(allSongsAtom);
	if (allSongs === undefined) {
		return undefined;
	}
	return extractRecentlyAddedFilterValues(allSongs);
});

const recentlyAddedBrowserFilterValuesMapAsyncAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
	const collator = get(localeCollatorAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return undefined;
	}

	return await fetchBrowserFilterValues(
		mpdClient,
		currentMpdProfile,
		browserFilters,
		collator,
	);
});

const recentlyAddedSortedBrowserFilterValuesMapAsyncAtom = atom(async (get) => {
	const sortedAllFilterValuesMap = get(allSongsSortedFilterValuesMapAtom);
	const browserFilterValuesMap = await get(
		recentlyAddedBrowserFilterValuesMapAsyncAtom,
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

const recentlyAddedSlowSortedBrowserFilterValuesMapAtom = atomWithSync(
	recentlyAddedSortedBrowserFilterValuesMapAsyncAtom,
);

const recentlyAddedFastSortedBrowserFilterValuesMapAtom = atom((get) => {
	const fastState = get(recentlyAddedFastStateAtom);
	return extractRecentlyAddedFastFilterValues(fastState.songs);
});

const recentlyAddedSortedBrowserFilterValuesMapAtom = atom((get) => {
	const capabilities = get(mpdCapabilitiesAtom);
	if (capabilities.isMpd024OrLater) {
		return get(recentlyAddedFastSortedBrowserFilterValuesMapAtom);
	}
	return get(recentlyAddedSlowSortedBrowserFilterValuesMapAtom);
});

export const filteredRecentlyAddedBrowserFilterValuesMapAtom = atom((get) => {
	const browserFilters = get(recentlyAddedBrowserFiltersAtom);
	const valuesMap = get(recentlyAddedSortedBrowserFilterValuesMapAtom);
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
				browserFilter.selectedValues.map((value) =>
					convertSongMetadataValueToString(value),
				),
				globalFilterTokens,
			),
		);
	}

	return filteredMap;
});
