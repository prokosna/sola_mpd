import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import { EditingSearchStatus } from "../types/searchTypes";
import { getDefaultSearch } from "../utils/searchUtils";

import {
  savedSearchesSyncAtom,
  useUpdateSavedSearchesState,
} from "./savedSearchesState";

export const editingSearchAtom = atom(getDefaultSearch());

const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

/**
 * Hook to access the current state of the editing search.
 * @returns The current editing search state.
 */
export function useEditingSearchState() {
  return useAtomValue(editingSearchAtom);
}

/**
 * Hook to access the current status of the editing search.
 * @returns The current editing search status.
 */
export function useEditingSearchStatusState() {
  return useAtomValue(editingSearchStatusAtom);
}

/**
 * Hook to set the editing search state and its status.
 * @returns A function that takes a Search object and an optional EditingSearchStatus,
 * and updates both the editing search and its status.
 */
export function useSetEditingSearchState() {
  const setEditingSearch = useSetAtom(editingSearchAtom);
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

  return useCallback(
    (search: Search, status: EditingSearchStatus) => {
      setEditingSearchStatus(status);
      setEditingSearch(search);
    },
    [setEditingSearch, setEditingSearchStatus],
  );
}

/**
 * Hook to save the current editing search.
 * This function updates the saved searches with the current editing search,
 * either by updating an existing search or adding a new one.
 * After saving, it updates both the local state and persists the changes.
 * @returns A callback function that saves the current editing search when invoked.
 */
export function useSaveEditingSearch() {
  const editingSearch = useAtomValue(editingSearchAtom);
  const savedSearches = useAtomValue(savedSearchesSyncAtom);
  const updateSavedSearches = useUpdateSavedSearchesState();
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

  return useCallback(async () => {
    const index = savedSearches.searches.findIndex(
      (search) => search.name === editingSearch.name,
    );
    if (index >= 0) {
      savedSearches.searches[index] = editingSearch;
    } else {
      savedSearches.searches.push(editingSearch);
    }
    await updateSavedSearches(
      savedSearches,
      UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
    );
    setEditingSearchStatus(EditingSearchStatus.SAVED);
  }, [
    editingSearch,
    savedSearches,
    setEditingSearchStatus,
    updateSavedSearches,
  ]);
}
