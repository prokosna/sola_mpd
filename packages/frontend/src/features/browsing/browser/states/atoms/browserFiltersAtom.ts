import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { ROUTE_HOME_BROWSER } from "../../../../../const/routes";
import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";
import { filterStringsByGlobalFilter } from "../../../../global_filter";
import { globalFilterTokensAtom } from "../../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../../profile/states/atoms/mpdProfileAtom";
import { localeCollatorAtom } from "../../../../settings/states/atoms/localeAtom";
import {
	composeBrowserFilterView,
	fetchBrowserFilterValues,
} from "../../../common/functions/browserFilter";
import { browserSelectionAtom } from "./browserSelectionAtom";
import { browserStateAtom } from "./browserStateAtom";

// The workspace's panel set only. Not exported; every consumer goes through
// browserFiltersAtom below, which overlays the URL-derived selection.
export const browserFilterTagsAtom = atom((get) => {
	const browserState = get(browserStateAtom);
	return browserState?.filterTags;
});

export const browserFiltersAtom = atom((get) => {
	const filterTags = get(browserFilterTagsAtom);
	if (filterTags === undefined) {
		return undefined;
	}
	const selection = get(browserSelectionAtom);
	return composeBrowserFilterView(filterTags, selection);
});

const browserFilterValuesMapAsyncAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const filterTags = get(browserFilterTagsAtom);
	const selection = get(browserSelectionAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
	const collator = get(localeCollatorAtom);

	if (currentMpdProfile === undefined || filterTags === undefined) {
		return new Map<Song_MetadataTag, string[]>();
	}

	return await fetchBrowserFilterValues(
		mpdClient,
		currentMpdProfile,
		filterTags,
		selection,
		collator,
	);
});

const browserFilterValuesMapAtom = atomWithSync(
	browserFilterValuesMapAsyncAtom,
);

export const filteredBrowserFilterValuesMapAtom = atom((get) => {
	const browserFilters = get(browserFiltersAtom);
	const valuesMap = get(browserFilterValuesMapAtom);
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
				browserFilter.selectedValues,
				globalFilterTokens,
			),
		);
	}

	return filteredMap;
});
