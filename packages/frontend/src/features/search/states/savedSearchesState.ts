import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import {} from "../utils/searchSongsUtils";
import { savedSearchesRepositoryAtom } from "./savedSearchesRepository";

/**
 * Base atom for saved searches.
 *
 * Manages search configurations and history.
 */
const savedSearchesAtom = atomWithDefault<
  Promise<SavedSearches> | SavedSearches
>(async (get) => {
  const repository = get(savedSearchesRepositoryAtom);
  return await repository.fetch();
});

/**
 * Synchronized atom for saved searches.
 *
 * Ensures consistent updates across subscribers.
 */
export const savedSearchesSyncAtom = atomWithSync(savedSearchesAtom);

/**
 * Hook for accessing saved searches state.
 *
 * Provides read-only access to search configurations.
 *
 * @returns Current saved searches state
 */
export function useSavedSearchesState() {
  return useAtomValue(savedSearchesSyncAtom);
}

/**
 * Hook for refreshing saved searches.
 *
 * Triggers fresh fetch from storage.
 *
 * @returns Refresh function
 */
export function useRefreshSavedSearchesState() {
  return useSetAtom(savedSearchesAtom);
}

/**
 * Hook for updating saved searches.
 *
 * Updates state locally and optionally persists.
 *
 * @returns Update function
 */
export function useUpdateSavedSearchesState() {
  const setSavedSearches = useSetAtom(savedSearchesAtom);
  const repository = useAtomValue(savedSearchesRepositoryAtom);

  return useCallback(
    async (savedSearches: SavedSearches, mode: UpdateMode) => {
      if (mode & UpdateMode.LOCAL_STATE) {
        setSavedSearches(savedSearches);
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(savedSearches);
      }
    },
    [repository, setSavedSearches],
  );
}
