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

/**
 * Atom for search being edited.
 *
 * Initialized with default search config.
 */
export const editingSearchAtom = atom(getDefaultSearch());

/**
 * Atom for search edit status.
 *
 * Tracks modification state (NOT_SAVED, COLUMNS_UPDATED, SAVED).
 */
const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

/**
 * Hook for current editing search.
 *
 * Provides read-only access to search config.
 *
 * @returns Current search being edited
 */
export function useEditingSearchState() {
  return useAtomValue(editingSearchAtom);
}

/**
 * Hook for editing search status.
 *
 * Tracks if changes are saved.
 *
 * @returns Current edit status
 */
export function useEditingSearchStatusState() {
  return useAtomValue(editingSearchStatusAtom);
}

/**
 * Hook for updating editing search.
 *
 * Updates both search config and status.
 *
 * @returns Update function
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
 * Hook for saving editing search.
 *
 * Updates or adds search to saved searches.
 *
 * @returns Save function
 */
export function useSaveEditingSearch() {
  const editingSearch = useAtomValue(editingSearchAtom);
  const savedSearches = useAtomValue(savedSearchesSyncAtom);
  const updateSavedSearches = useUpdateSavedSearchesState();
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

  return useCallback(async () => {
    if (savedSearches === undefined) {
      return;
    }
    const index = savedSearches.searches.findIndex(
      (search) => search.name === editingSearch.name,
    );
    if (index >= 0) {
      savedSearches.searches[index] = editingSearch;
    } else {
      savedSearches.searches.push(editingSearch);
    }
    await updateSavedSearches(
      savedSearches.clone(),
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
