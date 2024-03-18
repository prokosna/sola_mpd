import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

import { COMPONENT_ID_SEARCH_SIDE_PANE } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import {
  SelectListProps,
  SelectListContextMenuItemParams,
} from "../../select_list";
import { useRestoreFromSavedSearch } from "../states/edit";
import {
  useSavedSearchesState,
  useSetSavedSearchesState,
} from "../states/persistent";
import { useSetTargetSearchState } from "../states/songs";

export function useSavedSearchesSelectListProps(): SelectListProps | undefined {
  const toast = useToast();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const savedSearches = useSavedSearchesState();
  const setSavedSearches = useSetSavedSearchesState();
  const restoreFromSavedSearch = useRestoreFromSavedSearch();
  const setTargetSearch = useSetTargetSearchState();

  const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
    [
      {
        items: [
          {
            name: "Delete",
            onClick: async (params?: SelectListContextMenuItemParams) => {
              if (
                params === undefined ||
                profile === undefined ||
                mpdClient === undefined ||
                savedSearches === undefined
              ) {
                return;
              }

              const index = savedSearches.findIndex(
                (search) => search.name === params.clickedValue,
              );
              if (index < 0) {
                return;
              }

              const newSearches = [...savedSearches];
              newSearches.splice(index, 1);
              setSavedSearches(newSearches);

              toast({
                status: "success",
                title: "Saved search successfully deleted",
                description: `Saved search "${params.clickedValue}" has been deleted.`,
              });
            },
          },
        ],
      },
    ];

  const onSelectValues = useCallback(
    async (selectedValues: string[]) => {
      if (selectedValues.length >= 2) {
        throw new Error("Multiple playlists are selected.");
      } else if (selectedValues.length === 1) {
        const savedSearch = savedSearches?.find(
          (search) => search.name === selectedValues[0],
        );
        if (savedSearch === undefined) {
          return;
        }
        restoreFromSavedSearch(savedSearch);
        setTargetSearch(undefined);
      }
    },
    [restoreFromSavedSearch, savedSearches, setTargetSearch],
  );

  const onCompleteLoading = async () => {};

  if (savedSearches === undefined) {
    return;
  }

  return {
    id: COMPONENT_ID_SEARCH_SIDE_PANE,
    values: savedSearches.map((search) => search.name),
    selectedValues: [],
    header: undefined,
    contextMenuSections,
    isLoading: false,
    allowMultipleSelection: false,
    onSelectValues,
    onCompleteLoading,
  };
}
