import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import {} from "../utils/searchSongsUtils";
import { savedSearchesRepositoryAtom } from "./savedSearchesRepository";

const savedSearchesAtom = atomWithDefault(async (get) => {
  const repository = get(savedSearchesRepositoryAtom);
  return await repository.fetch();
});

export const savedSearchesSyncAtom = atomWithSync(savedSearchesAtom);

/**
 * Hook to access the current state of saved searches.
 * @returns The current array of saved searches.
 */
export function useSavedSearchesState() {
  return useAtomValue(savedSearchesSyncAtom);
}

/**
 * Hook to refresh the saved searches state.
 * This triggers a re-fetch of the saved searches.
 * @returns A function that, when called, will refresh the saved searches state.
 */
export function useRefreshSavedSearchesState() {
  return useSetAtom(savedSearchesAtom);
}

/**
 * Hook to update the saved searches state.
 * @returns A function that updates the saved searches state locally and/or persists it.
 */
export function useUpdateSavedSearchesState() {
  const setSavedSearches = useSetAtom(savedSearchesAtom);
  const repository = useAtomValue(savedSearchesRepositoryAtom);

  return useCallback(
    async (savedSearches: SavedSearches, mode: UpdateMode) => {
      if (mode & UpdateMode.LOCAL_STATE) {
        setSavedSearches(Promise.resolve(savedSearches));
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(savedSearches);
      }
    },
    [repository, setSavedSearches],
  );
}
