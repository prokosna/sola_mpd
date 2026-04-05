import { create } from "@bufbuild/protobuf";
import { BrowserFilterSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/utils/songUtils.js";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { allSongsAtom } from "../../../../all_songs/states/atoms/allSongsAtom";
import { filterStringsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { localeCollatorAtom } from "../../../../settings/states/atoms/localeAtom";
import { fetchBrowserFilterValues } from "../../../common/utils/browserFilterUtils";
import {
	extractRecentlyAddedFilterValues,
	sortRecentlyAddedFilterValues,
} from "../../utils/recentlyAddedFilterUtils";
import { recentlyAddedStateAtom } from "./recentlyAddedStateAtom";

const recentlyAddedFiltersAtom = atom((get) => {
	const recentlyAddedState = get(recentlyAddedStateAtom);
	return recentlyAddedState?.filters;
});

export const recentlyAddedBrowserFiltersAtom = atomWithDefault((get) => {
	const recentlyAddedFilters = get(recentlyAddedFiltersAtom);
	const browserFilters = recentlyAddedFilters?.map((filter, index) => {
		return create(BrowserFilterSchema, {
			tag: filter.tag,
			selectedValues: [],
			order: index,
			selectedOrder: -1,
		});
	});
	return browserFilters;
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

const recentlyAddedSortedBrowserFilterValuesMapAtom = atomWithSync(
	recentlyAddedSortedBrowserFilterValuesMapAsyncAtom,
);

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
