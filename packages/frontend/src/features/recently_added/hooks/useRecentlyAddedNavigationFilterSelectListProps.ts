import { RecentlyAddedFilter } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback } from "react";

import { COMPONENT_ID_RECENTLY_ADDED_FILTER_LIST_PREFIX } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import {
  SelectListProps,
  SelectListContextMenuItemParams,
} from "../../select_list";
import { convertSongMetadataTagToDisplayName } from "../../song_table";
import {
  useRecentlyAddedFilterValuesState,
  useRecentlyAddedFiltersState,
  useRecentlyAddedSelectedFilterValuesState,
  useSetRecentlyAddedSelectedFilterValuesState,
  useUpdateRecentlyAddedFiltersState,
} from "../states/recentlyAddedFiltersState";
import {
  addRecentlyAddedFilterNext,
  changeRecentlyAddedFilterToTheOtherTag,
  removeRecentlyAddedFilter,
} from "../utils/recentlyAddedFilterUtils";

export function useRecentlyAddedNavigationFilterSelectListProps(
  recentlyAddedFilter: RecentlyAddedFilter,
  availableTags: Song_MetadataTag[],
): SelectListProps | undefined {
  const recentlyAddedFilters = useRecentlyAddedFiltersState();
  const values = useRecentlyAddedFilterValuesState(recentlyAddedFilter.tag);
  const currentSelectedValues = useRecentlyAddedSelectedFilterValuesState(
    recentlyAddedFilter.tag,
  );
  const setSelectedValues = useSetRecentlyAddedSelectedFilterValuesState();
  const updateRecentlyAddedFilters = useUpdateRecentlyAddedFiltersState();

  // Handlers
  const onItemsSelected = useCallback(
    async (selectedValueStrings: string[]) => {
      if (
        recentlyAddedFilters === undefined ||
        currentSelectedValues === undefined
      ) {
        return;
      }

      // If selected values are the same with the current state, just ignore the callback.
      const currentSelectedValueStrings = currentSelectedValues.map(
        (selectedValue) => convertSongMetadataValueToString(selectedValue),
      );
      const currentSelectedValueStringsSet = new Set(
        currentSelectedValueStrings,
      );
      const selectedValueStringsSet = new Set(selectedValueStrings);
      if (
        currentSelectedValueStringsSet.size === selectedValueStringsSet.size &&
        [...currentSelectedValueStringsSet].every((v) =>
          selectedValueStringsSet.has(v),
        )
      ) {
        return;
      }

      setSelectedValues(recentlyAddedFilter.tag, selectedValueStrings);
    },
    [
      recentlyAddedFilter,
      recentlyAddedFilters,
      currentSelectedValues,
      setSelectedValues,
    ],
  );

  const onLoadingCompleted = useCallback(async () => {}, []);

  if (
    values === undefined ||
    recentlyAddedFilters === undefined ||
    currentSelectedValues === undefined
  ) {
    return undefined;
  }

  const selectedValues = currentSelectedValues.map((value) =>
    convertSongMetadataValueToString(value),
  );

  // Context menu
  const contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[] =
    [
      {
        items: [
          {
            name: "Change to",
            subItems: availableTags.map((tag) => ({
              name: convertSongMetadataTagToDisplayName(tag),
              onClick: async (params) => {
                if (params === undefined) {
                  return;
                }
                const newFilters = changeRecentlyAddedFilterToTheOtherTag(
                  recentlyAddedFilters,
                  recentlyAddedFilter,
                  tag,
                );
                await updateRecentlyAddedFilters(newFilters);
              },
            })),
          },
        ],
      },
    ];
  if (availableTags.length !== 0) {
    contextMenuSections[0].items.push({
      name: "Add Panel Below",
      onClick: async (params) => {
        if (params === undefined) {
          return;
        }
        const newFilters = addRecentlyAddedFilterNext(
          recentlyAddedFilters,
          recentlyAddedFilter,
          availableTags[0],
        );
        await updateRecentlyAddedFilters(newFilters);
      },
    });
  }
  if (recentlyAddedFilters.length > 1) {
    contextMenuSections[0].items.push({
      name: "Remove Panel",
      onClick: async (params) => {
        if (params === undefined) {
          return;
        }
        const newFilters = removeRecentlyAddedFilter(
          recentlyAddedFilters,
          recentlyAddedFilter,
        );
        await updateRecentlyAddedFilters(newFilters);
      },
    });
  }

  return {
    id: `${COMPONENT_ID_RECENTLY_ADDED_FILTER_LIST_PREFIX}_${recentlyAddedFilter.tag}`,
    values,
    selectedValues,
    headerTitle: convertSongMetadataTagToDisplayName(recentlyAddedFilter.tag),
    contextMenuSections,
    isLoading: false,
    allowMultipleSelection: true,
    onItemsSelected,
    onLoadingCompleted,
  };
}
