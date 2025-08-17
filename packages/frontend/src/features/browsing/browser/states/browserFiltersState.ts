import { clone } from "@bufbuild/protobuf";
import {
	type BrowserFilter,
	BrowserStateSchema,
} from "@sola_mpd/domain/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { atom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { ROUTE_HOME_BROWSER } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import type { UpdateMode } from "../../../../types/stateTypes";
import { filterStringsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../../location/states/locationState";
import { mpdClientAtom } from "../../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../../profile/states/mpdProfileState";

import { localeCollatorAtom } from "../../../settings/states/settingsLocale";
import { fetchBrowserFilterValues } from "../../common/utils/browserFilterUtils";
import { browserStateSyncAtom, useUpdateBrowserState } from "./browserState";

/**
 * Atom for accessing synchronized browser filters.
 * Derived from the main browser state.
 */
export const browserFiltersSyncAtom = atom((get) => {
	const browserState = get(browserStateSyncAtom);
	return browserState?.filters;
});

/**
 * Base atom for storing filter values map.
 * Fetches values from MPD server based on current filters.
 */
const browserFilterValuesMapAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const browserFilters = get(browserFiltersSyncAtom);
	const currentMpdProfile = get(currentMpdProfileSyncAtom);
	const collator = get(localeCollatorAtom);

	if (currentMpdProfile === undefined || browserFilters === undefined) {
		return new Map<Song_MetadataTag, string[]>();
	}

	return await fetchBrowserFilterValues(
		mpdClient,
		currentMpdProfile,
		browserFilters,
		collator,
	);
});

/**
 * Synchronized atom for filter values map with persistence support.
 */
const browserFilterValuesMapSyncAtom = atomWithSync(browserFilterValuesMapAtom);

/**
 * Derived atom that applies global filter to browser filter values.
 * Only filters values when on the browser route.
 */
const filteredBrowserFilterValuesMapSyncAtom = atom((get) => {
	const browserFilters = get(browserFiltersSyncAtom);
	const valuesMap = get(browserFilterValuesMapSyncAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (pathname !== ROUTE_HOME_BROWSER || browserFilters === undefined) {
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
 * Hook to access the current browser filters state.
 *
 * @returns Array of browser filters or undefined if not available
 */
export function useBrowserFiltersState() {
	return useAtomValue(browserFiltersSyncAtom);
}

/**
 * Hook to access the current browser filter values map state.
 * This map is filtered based on global filter and current route.
 *
 * @returns Map of metadata tags to their filtered values
 */
export function useBrowserFilterValuesMapState() {
	return useAtomValue(filteredBrowserFilterValuesMapSyncAtom);
}

/**
 * Hook to update browser filters state with debounced persistence.
 *
 * Features:
 * - Automatic state updates
 * - 1 second debounce for persistence
 * - Error handling with notifications
 *
 * @returns Function to update browser filters
 */
export function useUpdateBrowserFiltersState() {
	const browserState = useAtomValue(browserStateSyncAtom);
	const updateBrowserState = useUpdateBrowserState();

	return useCallback(
		async (browserFilters: BrowserFilter[], mode: UpdateMode) => {
			if (browserState === undefined) {
				return;
			}
			const newBrowserState = clone(BrowserStateSchema, browserState);
			newBrowserState.filters = browserFilters;
			await updateBrowserState(newBrowserState, mode);
		},
		[browserState, updateBrowserState],
	);
}
