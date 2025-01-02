import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { convertSongMetadataValueToString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useCallback } from "react";

import { COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX } from "../../../const/component";
import { UpdateMode } from "../../../types/stateTypes";
import { ContextMenuSection } from "../../context_menu";
import {
  SelectListProps,
  SelectListContextMenuItemParams,
} from "../../select_list/";
import { convertSongMetadataTagToDisplayName } from "../../song_table";
import {
  useBrowserFilterValuesState,
  useBrowserFiltersState,
  useUpdateBrowserFiltersState,
} from "../states/browserFiltersState";
import {
  addBrowserFilterNext,
  changeBrowserFilterToTheOtherTag,
  removeBrowserFilter,
  selectBrowserFilterValues,
} from "../utils/browserFilterUtils";

/**
 * Custom hook for managing browser navigation filter select list properties.
 *
 * Features:
 * - Dynamic filter value selection
 * - Context menu integration for filter management
 * - Filter tag switching
 * - Multi-select support
 * - State synchronization
 *
 * @param browserFilter - Current browser filter configuration
 * @param availableTags - List of available metadata tags for switching
 * @returns SelectList properties or undefined if data not ready
 */
export function useBrowserNavigationFilterSelectListProps(
  browserFilter: BrowserFilter,
  availableTags: Song_MetadataTag[],
): SelectListProps | undefined {
  const browserFilters = useBrowserFiltersState();
  const values = useBrowserFilterValuesState(browserFilter.tag);
  const updateBrowserFilters = useUpdateBrowserFiltersState();

  // Handlers
  const onItemsSelected = useCallback(
    async (selectedValues: string[]) => {
      if (browserFilters === undefined) {
        return;
      }

      // If selected values are the same with the current state, just ignore the callback.
      const currentSelectedValues = browserFilter.selectedValues.map(
        (selectedValue) => convertSongMetadataValueToString(selectedValue),
      );
      const currentSelectedValuesSet = new Set(currentSelectedValues);
      const selectedValuesSet = new Set(selectedValues);
      if (
        currentSelectedValuesSet.size === selectedValuesSet.size &&
        [...currentSelectedValuesSet].every((v) => selectedValuesSet.has(v))
      ) {
        return;
      }

      const newFilters = selectBrowserFilterValues(
        browserFilters,
        browserFilter,
        selectedValues,
      );
      await updateBrowserFilters(
        newFilters,
        UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
      );
    },
    [browserFilter, browserFilters, updateBrowserFilters],
  );

  const onLoadingCompleted = useCallback(async () => {}, []);

  if (values === undefined || browserFilters === undefined) {
    return undefined;
  }

  const selectedValues = browserFilter.selectedValues.map((value) =>
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
                const newFilters = changeBrowserFilterToTheOtherTag(
                  browserFilters,
                  browserFilter,
                  tag,
                );
                await updateBrowserFilters(
                  newFilters,
                  UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
                );
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
        const newFilters = addBrowserFilterNext(
          browserFilters,
          browserFilter,
          availableTags[0],
        );
        await updateBrowserFilters(
          newFilters,
          UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
        );
      },
    });
  }
  if (browserFilters.length > 1) {
    contextMenuSections[0].items.push({
      name: "Remove Panel",
      onClick: async (params) => {
        if (params === undefined) {
          return;
        }
        const newFilters = removeBrowserFilter(browserFilters, browserFilter);
        await updateBrowserFilters(
          newFilters,
          UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
        );
      },
    });
  }

  return {
    id: `${COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX}_${browserFilter.tag}`,
    values,
    selectedValues,
    headerTitle: convertSongMetadataTagToDisplayName(browserFilter.tag),
    contextMenuSections,
    isLoading: false,
    allowMultipleSelection: true,
    onItemsSelected,
    onLoadingCompleted,
  };
}
