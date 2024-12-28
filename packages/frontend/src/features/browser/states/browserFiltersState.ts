import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { atom, useAtomValue } from "jotai";
import { useCallback } from "react";

import { ROUTE_HOME_BROWSER } from "../../../const/routes";
import { UpdateMode } from "../../../types/stateTypes";
import { filterStringsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchBrowserFilterValues } from "../utils/browserFilterUtils";

import { browserStateSyncAtom, useUpdateBrowserState } from "./browserState";

export const browserFiltersSyncAtom = atom(async (get) => {
  const browserState = await get(browserStateSyncAtom);
  return browserState.filters;
});

const browserFilterValuesMapSyncAtom = atom(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const browserFilters = await get(browserFiltersSyncAtom);
  const currentMpdProfile = await get(currentMpdProfileSyncAtom);

  if (currentMpdProfile === undefined) {
    return new Map<Song_MetadataTag, string[]>();
  }

  return fetchBrowserFilterValues(mpdClient, currentMpdProfile, browserFilters);
});

// Browser filter values map filtered by global filter tokens.
const filteredBrowserFilterValuesMapSyncAtom = atom(async (get) => {
  const browserFilters = await get(browserFiltersSyncAtom);
  const valuesMap = await get(browserFilterValuesMapSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_BROWSER) {
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
 * Returns the browser filters state.
 * @returns The browser filters state.
 */
export function useBrowserFiltersState() {
  return useAtomValue(browserFiltersSyncAtom);
}

/**
 * Returns the browser filter values for a given tag.
 * @param tag The song metadata tag.
 * @returns The browser filter values.
 */
export function useBrowserFilterValuesState(tag: Song_MetadataTag) {
  const valuesMap = useAtomValue(filteredBrowserFilterValuesMapSyncAtom);
  return valuesMap?.get(tag);
}

/**
 * Returns a function to update browser filters state.
 *
 * The state is automatically updated and persisted with 1 second debounce.
 * @returns Function to call to update a state.
 */
export function useUpdateBrowserFiltersState() {
  const browserState = useAtomValue(browserStateSyncAtom);
  const updateBrowserState = useUpdateBrowserState();

  return useCallback(
    async (browserFilters: BrowserFilter[], mode: UpdateMode) => {
      const newBrowserState = browserState.clone();
      newBrowserState.filters = browserFilters;
      await updateBrowserState(newBrowserState, mode);
    },
    [browserState, updateBrowserState],
  );
}
