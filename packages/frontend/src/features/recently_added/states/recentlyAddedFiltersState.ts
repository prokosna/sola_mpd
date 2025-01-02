import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import {
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { useCallback } from "react";

import { ROUTE_HOME_RECENTLY_ADDED } from "../../../const/routes";
import { UpdateMode } from "../../../types/stateTypes";
import { allSongsSyncAtom } from "../../all_songs/states/allSongsState";
import { filterStringsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import {
  extractRecentlyAddedFilterValues,
  listRecentlyAddedSongMetadataTags,
} from "../utils/recentlyAddedFilterUtils";

import {
  recentlyAddedStateSyncAtom,
  useUpdateRecentlyAddedState,
} from "./recentlyAddedState";

/**
 * Filter configurations.
 */
export const recentlyAddedFiltersSyncAtom = atom((get) => {
  const recentlyAddedState = get(recentlyAddedStateSyncAtom);
  return recentlyAddedState?.filters;
});

/**
 * Selected filter values.
 */
export const recentlyAddedSelectedFilterValuesAtom = atomWithDefault<
  Map<Song_MetadataTag, Song_MetadataValue[]>
>((_get) => {
  const map = new Map();
  for (const tag of listRecentlyAddedSongMetadataTags()) {
    map.set(tag, []);
  }
  return map;
});

/**
 * Derived atom for filter values map.
 */
const recentlyAddedFilterValuesMapSyncAtom = atom((get) => {
  const allSongs = get(allSongsSyncAtom);

  if (allSongs === undefined) {
    return undefined;
  }

  return extractRecentlyAddedFilterValues(allSongs);
});

/**
 * Filtered values map.
 */
const filteredRecentlyAddedFilterValuesMapSyncAtom = atom((get) => {
  const recentlyAddedFilters = get(recentlyAddedFiltersSyncAtom);
  const valuesMap = get(recentlyAddedFilterValuesMapSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);
  const selectedValuesMap = get(recentlyAddedSelectedFilterValuesAtom);

  if (
    pathname !== ROUTE_HOME_RECENTLY_ADDED ||
    recentlyAddedFilters === undefined ||
    valuesMap === undefined
  ) {
    return valuesMap;
  }

  const filteredMap = new Map(valuesMap);

  for (const filter of recentlyAddedFilters) {
    const values = valuesMap.get(filter.tag);
    const selectedValues = selectedValuesMap.get(filter.tag) ?? [];
    if (values === undefined) {
      continue;
    }
    filteredMap.set(
      filter.tag,
      filterStringsByGlobalFilter(
        values,
        selectedValues.map((value) => convertSongMetadataValueToString(value)),
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
export function useRecentlyAddedFiltersState() {
  return useAtomValue(recentlyAddedFiltersSyncAtom);
}

/**
 * Get filter values for tag.
 *
 * @param tag Target tag
 * @returns Tag values
 */
export function useRecentlyAddedFilterValuesState(tag: Song_MetadataTag) {
  const valuesMap = useAtomValue(filteredRecentlyAddedFilterValuesMapSyncAtom);
  return valuesMap?.get(tag);
}

/**
 * Get selected values for tag.
 *
 * @param tag Target tag
 * @returns Selected values
 */
export function useRecentlyAddedSelectedFilterValuesState(
  tag: Song_MetadataTag,
) {
  const selectedValuesMap = useAtomValue(recentlyAddedSelectedFilterValuesAtom);
  return selectedValuesMap.get(tag);
}

/**
 * Set selected values for tag.
 *
 * @returns Values setter
 */
export function useSetRecentlyAddedSelectedFilterValuesState() {
  const selectedValuesMap = useAtomValue(recentlyAddedSelectedFilterValuesAtom);
  const setSelectedValuesMap = useSetAtom(
    recentlyAddedSelectedFilterValuesAtom,
  );

  return useCallback(
    (tag: Song_MetadataTag, values: string[]) => {
      const newMap = new Map(selectedValuesMap);
      newMap.set(
        tag,
        values.map(
          (value) =>
            new Song_MetadataValue({
              value: { case: "stringValue", value: { value } },
            }),
        ),
      );
      setSelectedValuesMap(newMap);
    },
    [selectedValuesMap, setSelectedValuesMap],
  );
}

/**
 * Update filter configurations.
 *
 * @returns Filter updater
 */
export function useUpdateRecentlyAddedFiltersState() {
  const recentlyAddedState = useAtomValue(recentlyAddedStateSyncAtom);
  const updateRecentlyAddedState = useUpdateRecentlyAddedState();

  return useCallback(
    async (filters: RecentlyAddedFilter[]) => {
      if (recentlyAddedState === undefined) {
        return;
      }
      const newState = recentlyAddedState.clone();
      newState.filters = filters;
      await updateRecentlyAddedState(
        newState,
        UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
      );
    },
    [recentlyAddedState, updateRecentlyAddedState],
  );
}
