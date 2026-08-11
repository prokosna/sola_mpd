import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
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
	applyBrowserSelectionToFilters,
	fetchBrowserFilterValues,
} from "../../../common/functions/browserFilter";
import { browserSelectionAtom } from "./browserSelectionAtom";
import { browserStateAtom } from "./browserStateAtom";

// Only `tag`/`order` are authoritative here; the selection lives in the URL.
// Deliberately not exported, so every consumer goes through browserFiltersAtom
// below and sees the two overlaid.
const browserFiltersServerAtom = atom((get) => {
	const browserState = get(browserStateAtom);
	return browserState?.filters;
});

export const browserFiltersAtom = atom((get) => {
	const serverFilters = get(browserFiltersServerAtom);
	if (serverFilters === undefined) {
		return undefined;
	}
	const selection = get(browserSelectionAtom);
	return applyBrowserSelectionToFilters(serverFilters, selection);
});

const browserFilterValuesMapAsyncAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const browserFilters = get(browserFiltersAtom);
	const currentMpdProfile = get(currentMpdProfileAtom);
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
				browserFilter.selectedValues.map((value) =>
					convertSongMetadataValueToString(value),
				),
				globalFilterTokens,
			),
		);
	}

	return filteredMap;
});
