import { useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useAppStore } from "../../global/store/AppStore";

import { FilterCondition, FilterConditionOperator } from "@/models/filter";
import { Query, Search } from "@/models/search";
import { SongMetadataTag, SongMetadataValue } from "@/models/song";
import { FilterUtils } from "@/utils/FilterUtils";
import { SongTableUtils } from "@/utils/SongTableUtils";
import { SongUtils } from "@/utils/SongUtils";

export function useSearchEditor() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const editingSearch = useAppStore((state) => state.editingSearch);
  const isEditingSearchSaved = useAppStore(
    (state) => state.isEditingSearchSaved,
  );
  const searchSongTableColumns = useAppStore(
    (state) => state.searchSongTableColumns,
  );
  const commonSongTableState = useAppStore(
    (state) => state.commonSongTableState,
  );
  const savedSearches = useAppStore((state) => state.savedSearches);
  const pullSearchSongs = useAppStore((state) => state.pullSearchSongs);
  const updateEditingSearch = useAppStore((state) => state.updateEditingSearch);
  const updateSavedSearches = useAppStore((state) => state.updateSavedSearches);
  const updateIsEditingSearchSaved = useAppStore(
    (state) => state.updateIsEditingSearchSaved,
  );
  const updateSearchSongTableColumns = useAppStore(
    (state) => state.updateSearchSongTableColumns,
  );
  const getDefaultSearch = useAppStore((state) => state.getDefaultSearch);
  const updateSearchSongs = useAppStore((state) => state.updateSearchSongs);
  const toast = useToast();

  const existingNames = useMemo(() => {
    return savedSearches?.map((v) => v.name) || [];
  }, [savedSearches]);

  const getDefaultFilterCondition = (uuid: string) =>
    FilterCondition.create({
      uuid,
      tag: SongMetadataTag.TITLE,
      operator: FilterConditionOperator.EQUAL,
      value: SongMetadataValue.create({
        value: {
          $case: "stringValue",
          stringValue: "",
        },
      }),
    });

  const [errorMessage, setErrorMessage] = useState("");

  const [currentSearch, setCurrentSearch] = useState(editingSearch);

  const updateCurrentSearch = useCallback(
    (search: Search) => {
      updateIsEditingSearchSaved(false);
      setCurrentSearch(search);
    },
    [updateIsEditingSearchSaved],
  );

  useEffect(() => {
    setCurrentSearch(editingSearch);
    updateSearchSongs([]);
  }, [editingSearch, updateSearchSongs]);

  useEffect(() => {
    if (
      editingSearch.columns !== undefined &&
      editingSearch.columns.length > 0
    ) {
      updateSearchSongTableColumns(editingSearch.columns);
    } else if (commonSongTableState?.columns !== undefined) {
      updateSearchSongTableColumns(commonSongTableState.columns);
    }
  }, [
    commonSongTableState?.columns,
    editingSearch.columns,
    updateSearchSongTableColumns,
  ]);

  const songMetadataTagOptionsForDisplay =
    SongUtils.listAllSongMetadataTags().filter((v) =>
      SongTableUtils.convertSongMetadataTagToDisplayName(v),
    );

  const operatorOptions = FilterUtils.listAllFilterConditionOperators();
  const onConditionAdded = useCallback(
    (andBlockIndex: number) => {
      const newSearch = produce(currentSearch, (draft) => {
        const conditions = draft.queries[andBlockIndex]?.conditions;
        if (conditions === undefined) {
          toast({
            status: "error",
            title: "System error",
            description: "Inconsistent search: index to add not found.",
          });
          return;
        }
        conditions.push(getDefaultFilterCondition(uuidv4()));
      });
      updateEditingSearch(newSearch, false);
    },
    [currentSearch, toast, updateEditingSearch],
  );

  const onConditionRemoved = useCallback(
    (uuid: string) => {
      if (currentSearch.queries === undefined) {
        return;
      }
      const newSearch = produce(currentSearch, (draft) => {
        for (const query of draft.queries!) {
          const index = query.conditions.findIndex(
            (filter) => filter.uuid === uuid,
          );
          if (index >= 0) {
            query.conditions.splice(index, 1);
            break;
          }
        }
        // If this was the last item, delete the group itself
        draft.queries = draft.queries!.filter((v) => v.conditions.length > 0);
      });
      updateEditingSearch(newSearch, false);
    },
    [currentSearch, updateEditingSearch],
  );

  const onQueryAdded = useCallback(() => {
    if (currentSearch.queries === undefined) {
      return;
    }
    const newSearch = produce(currentSearch, (draft) => {
      draft.queries!.push(
        Query.create({
          conditions: [getDefaultFilterCondition(uuidv4())],
        }),
      );
    });
    updateEditingSearch(newSearch, false);
  }, [currentSearch, updateEditingSearch]);

  const onSearchClicked = useCallback(() => {
    if (profile === undefined) {
      return;
    }
    pullSearchSongs(profile, currentSearch);
  }, [currentSearch, profile, pullSearchSongs]);

  const onResetClicked = useCallback(() => {
    setCurrentSearch(getDefaultSearch());
    updateSearchSongTableColumns(commonSongTableState?.columns);
    updateIsEditingSearchSaved(false);
    updateSearchSongs([]);
    toast({
      status: "success",
      title: "Search reset",
      description: "Search conditions are reset.",
    });
  }, [
    commonSongTableState?.columns,
    getDefaultSearch,
    toast,
    updateIsEditingSearchSaved,
    updateSearchSongTableColumns,
    updateSearchSongs,
  ]);

  const onSaveClicked = useCallback(() => {
    if (savedSearches === undefined) {
      return;
    }
    if (currentSearch.name === "") {
      setErrorMessage("A name is required.");
      return;
    }
    const newCurrentSearch = produce(currentSearch, (draft) => {
      if (searchSongTableColumns === undefined) {
        return;
      }
      draft.columns = searchSongTableColumns;
    });
    const index = existingNames.findIndex((v) => v === currentSearch.name);
    const newSavedSearches = produce(savedSearches, (draft) => {
      if (index >= 0) {
        draft[index] = newCurrentSearch;
      } else {
        draft.push(newCurrentSearch);
      }
    });
    updateSavedSearches(newSavedSearches);
    updateIsEditingSearchSaved(true);
    toast({
      status: "success",
      title: "Search saved",
      description: "Search conditions are saved.",
    });
  }, [
    currentSearch,
    existingNames,
    savedSearches,
    searchSongTableColumns,
    toast,
    updateIsEditingSearchSaved,
    updateSavedSearches,
  ]);

  const isUpdate = useMemo(() => {
    if (existingNames.includes(currentSearch.name)) {
      return true;
    }
    return false;
  }, [currentSearch.name, existingNames]);

  return {
    currentSearch,
    isEditingSearchSaved,
    songMetadataTagOptionsForDisplay,
    operatorOptions,
    errorMessage,
    isUpdate,
    updateCurrentSearch,
    onConditionAdded,
    onConditionRemoved,
    onConditionGroupAdded: onQueryAdded,
    onSearchClicked,
    onResetClicked,
    onSaveClicked,
  };
}
