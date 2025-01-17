import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { useCallback } from "react";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../../const/routes";
import { UpdateMode } from "../../../../types/stateTypes";
import { allSongsSyncAtom } from "../../../all_songs/states/allSongsState";
import { filterStringsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../../location/states/locationState";
import {
	extractRecentlyAddedFilterValues,
	sortRecentlyAddedFilterValues,
} from "../utils/recentlyAddedFilterUtils";

import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../../profile/states/mpdProfileState";
import { localeCollatorAtom } from "../../../settings/states/settingsLocale";
import { fetchBrowserFilterValues } from "../../common/utils/browserFilterUtils";
import {
	recentlyAddedStateSyncAtom,
	useUpdateRecentlyAddedState,
} from "./recentlyAddedState";

/**
 * Filter configurations.
 */
const recentlyAddedFiltersSyncAtom = atom((get) => {
	const recentlyAddedState = get(recentlyAddedStateSyncAtom);
	return recentlyAddedState?.filters;
});

export const recentlyAddedBrowserFiltersSyncAtom = atomWithDefault((get) => {
	const recentlyAddedFilters = get(recentlyAddedFiltersSyncAtom);
	const browserFilters = recentlyAddedFilters?.map((filter, index) => {
		return new BrowserFilter({
			tag: filter.tag,
			selectedValues: [],
			order: index,
			selectedOrder: -1,
		});
	});
	return browserFilters;
});

/**
 * Derived atom for filter values map.
 */
const allSongsSortedFilterValuesMapSyncAtom = atom((get) => {
	const allSongs = get(allSongsSyncAtom);

	if (allSongs === undefined) {
		return undefined;
	}

	return extractRecentlyAddedFilterValues(allSongs);
});

const recentlyAddedBrowserFilterValuesMapAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const browserFilters = get(recentlyAddedBrowserFiltersSyncAtom);
	const currentMpdProfile = get(currentMpdProfileSyncAtom);
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

const recentlyAddedSortedBrowserFilterValuesMapAtom = atom(async (get) => {
	const sortedAllFilterValuesMap = get(allSongsSortedFilterValuesMapSyncAtom);
	const browserFilterValuesMap = await get(
		recentlyAddedBrowserFilterValuesMapAtom,
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

const recentlyAddedSortedBrowserFilterValuesMapSyncAtom = atomWithSync(
	recentlyAddedSortedBrowserFilterValuesMapAtom,
);

/**
 * Derived atom that applies global filter to browser filter values.
 * Only filters values when on the browser route.
 */
const filteredRecentlyAddedBrowserFilterValuesMapSyncAtom = atom((get) => {
	const browserFilters = get(recentlyAddedBrowserFiltersSyncAtom);
	const valuesMap = get(recentlyAddedSortedBrowserFilterValuesMapSyncAtom);
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

/**
 * Get filter configurations.
 *
 * @returns Current filters
 */
export function useRecentlyAddedBrowserFiltersState() {
	return useAtomValue(recentlyAddedBrowserFiltersSyncAtom);
}

export function useRecentlyAddedBrowserFilterValuesMapState() {
	return useAtomValue(filteredRecentlyAddedBrowserFilterValuesMapSyncAtom);
}

/**
 * Update filter configurations.
 *
 * @returns Filter updater
 */
export function useUpdateRecentlyAddedBrowserFiltersState() {
	const recentlyAddedState = useAtomValue(recentlyAddedStateSyncAtom);
	const setBrowserFiltersState = useSetAtom(
		recentlyAddedBrowserFiltersSyncAtom,
	);
	const updateRecentlyAddedState = useUpdateRecentlyAddedState();

	return useCallback(
		async (filters: BrowserFilter[], _mode: UpdateMode) => {
			if (recentlyAddedState === undefined) {
				return;
			}
			setBrowserFiltersState(filters);
			const newState = recentlyAddedState.clone();
			newState.filters = filters.map(
				(filter) =>
					new RecentlyAddedFilter({
						tag: filter.tag,
					}),
			);
			await updateRecentlyAddedState(newState, UpdateMode.PERSIST);
		},
		[recentlyAddedState, setBrowserFiltersState, updateRecentlyAddedState],
	);
}
