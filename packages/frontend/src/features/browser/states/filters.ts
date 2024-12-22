import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { atom, useAtom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { ROUTE_HOME_BROWSER } from "../../../const/routes";
import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { filterStringsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { fetchBrowserFilterValuesMap, sendBrowserState } from "../helpers/api";

import { browserStateAtom } from "./persistent";

const browserFiltersAtom = atomWithRefresh(async (get) => {
  const browserState = await get(browserStateAtom);
  return browserState.filters;
});

const unwrappedBrowserFiltersAtom = unwrap(
  browserFiltersAtom,
  (prev) => prev || undefined,
);

const browserFilterValuesMapAtom = atom(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const browserFilters = await get(browserFiltersAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return new Map<Song_MetadataTag, string[]>();
  }

  return fetchBrowserFilterValuesMap(
    mpdClient,
    currentMpdProfile,
    browserFilters,
  );
});

const filteredBrowserFilterValuesMapAtom = atom(async (get) => {
  const browserFilters = await get(browserFiltersAtom);
  const valuesMap = await get(browserFilterValuesMapAtom);
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
          SongUtils.convertSongMetadataValueToString(value),
        ),
        globalFilterTokens,
      ),
    );
  }

  return filteredMap;
});

const unwrappedFilteredBrowserFilterValuesMapAtom = unwrap(
  filteredBrowserFilterValuesMapAtom,
  (prev) => prev || undefined,
);

export { browserFiltersAtom };

export function useBrowserFiltersState() {
  return useAtomValue(unwrappedBrowserFiltersAtom);
}

export function useBrowserFilterValuesState(tag: Song_MetadataTag) {
  const valuesMap = useAtomValue(unwrappedFilteredBrowserFilterValuesMapAtom);
  return valuesMap?.get(tag);
}

export function useSetBrowserFiltersState() {
  const [browserState, refresh] = useAtom(browserStateAtom);

  return useCallback(
    async (browserFilters: BrowserFilter[]) => {
      const newBrowserState = browserState.clone();
      newBrowserState.filters = browserFilters;
      await sendBrowserState(newBrowserState);
      refresh();
    },
    [browserState, refresh],
  );
}
