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

export const recentlyAddedFiltersSyncAtom = atom((get) => {
  const recentlyAddedState = get(recentlyAddedStateSyncAtom);
  return recentlyAddedState?.filters;
});

export const recentlyAddedSelectedFilterValuesAtom = atomWithDefault<
  Map<Song_MetadataTag, Song_MetadataValue[]>
>((_get) => {
  const map = new Map();
  for (const tag of listRecentlyAddedSongMetadataTags()) {
    map.set(tag, []);
  }
  return map;
});

const recentlyAddedFilterValuesMapSyncAtom = atom((get) => {
  const allSongs = get(allSongsSyncAtom);

  if (allSongs === undefined) {
    return undefined;
  }

  return extractRecentlyAddedFilterValues(allSongs);
});

// Recently added filter values map filtered by global filter tokens.
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
 * Returns the recently added filters state.
 * @returns The recently added filters state.
 */
export function useRecentlyAddedFiltersState() {
  return useAtomValue(recentlyAddedFiltersSyncAtom);
}

/**
 * Returns the recently added filter values for a given tag.
 * @param tag The song metadata tag.
 * @returns The recently added filter values.
 */
export function useRecentlyAddedFilterValuesState(tag: Song_MetadataTag) {
  const valuesMap = useAtomValue(filteredRecentlyAddedFilterValuesMapSyncAtom);
  return valuesMap?.get(tag);
}

/**
 * Returns the recently added selected filter values for a given tag.
 * @param tag The song metadata tag.
 * @returns The recently added selected filter values.
 */
export function useRecentlyAddedSelectedFilterValuesState(
  tag: Song_MetadataTag,
) {
  const selectedValuesMap = useAtomValue(recentlyAddedSelectedFilterValuesAtom);
  return selectedValuesMap.get(tag);
}

/**
 * Returns a function to update recently added selected filter values state.
 * @returns Function to call to update a state.
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
 * Returns a function to update recently added filters state.
 *
 * The state is automatically updated and persisted with 1 second debounce.
 * @returns Function to call to update a state.
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
