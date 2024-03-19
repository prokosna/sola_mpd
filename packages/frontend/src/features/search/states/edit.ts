import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { getDefaultSearch } from "../helpers/search";
import { EditingSearchStatus } from "../types/search";

import {
  savedSearchesAtom,
  useRefreshSavedSearchesState,
  useSetSavedSearchesState,
} from "./persistent";

const editingSearchAtom = atom(getDefaultSearch());

const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

export { editingSearchAtom };

export function useEditingSearchState() {
  return useAtomValue(editingSearchAtom);
}

export function useEditingSearchStatusState() {
  return useAtomValue(editingSearchStatusAtom);
}

export function useSetEditingSearchState() {
  const setEditingSearch = useSetAtom(editingSearchAtom);
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

  return useCallback(
    (search: Search, status = EditingSearchStatus.NOT_SAVED) => {
      setEditingSearchStatus(status);
      setEditingSearch(search);
    },
    [setEditingSearch, setEditingSearchStatus],
  );
}

export function useRestoreFromSavedSearch() {
  const setEditingSearch = useSetAtom(editingSearchAtom);
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

  return useCallback(
    (search: Search) => {
      setEditingSearchStatus(EditingSearchStatus.SAVED);
      setEditingSearch(search);
    },
    [setEditingSearch, setEditingSearchStatus],
  );
}

export function useSaveEditingSearch() {
  const editingSearch = useAtomValue(editingSearchAtom);
  const updateSavedSearches = useSetSavedSearchesState();
  const savedSearches = useAtomValue(savedSearchesAtom);
  const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);
  const pullSavedSearches = useRefreshSavedSearchesState();

  return useCallback(async () => {
    const index = savedSearches.findIndex(
      (search) => search.name === editingSearch.name,
    );
    if (index >= 0) {
      savedSearches[index] = editingSearch;
    } else {
      savedSearches.push(editingSearch);
    }
    await updateSavedSearches(savedSearches);
    pullSavedSearches();
    setEditingSearchStatus(EditingSearchStatus.SAVED);
  }, [
    editingSearch,
    pullSavedSearches,
    savedSearches,
    setEditingSearchStatus,
    updateSavedSearches,
  ]);
}
