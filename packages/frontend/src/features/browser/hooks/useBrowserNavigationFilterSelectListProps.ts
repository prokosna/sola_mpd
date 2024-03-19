import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { useCallback } from "react";

import { COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX } from "../../../const/component";
import { ContextMenuSection } from "../../context_menu";
import {
  SelectListProps,
  SelectListContextMenuItemParams,
} from "../../select_list";
import { convertSongMetadataTagToDisplayName } from "../../song_table";
import {
  addFilterNext,
  changeFilterToOtherTag,
  removeFilter,
  selectFilterValues,
} from "../helpers/filter";
import {
  useBrowserFilterValuesState,
  useBrowserFiltersState,
  useSetBrowserFiltersState,
} from "../states/filters";

export function useBrowserNavigationFilterSelectListProps(
  browserFilter: BrowserFilter,
  availableTags: Song_MetadataTag[],
): SelectListProps | undefined {
  const browserFilters = useBrowserFiltersState();
  const values = useBrowserFilterValuesState(browserFilter.tag);
  const setBrowserFilters = useSetBrowserFiltersState();

  const onSelectValues = useCallback(
    async (selectedValues: string[]) => {
      if (browserFilters === undefined) {
        return;
      }

      // If selected values are the same with the current state, just ignore the callback.
      const currentSelectedValues = browserFilter.selectedValues.map(
        (selectedValue) =>
          SongUtils.convertSongMetadataValueToString(selectedValue),
      );
      const currentSelectedValuesSet = new Set(currentSelectedValues);
      const selectedValuesSet = new Set(selectedValues);
      if (
        currentSelectedValuesSet.size === selectedValuesSet.size &&
        [...currentSelectedValuesSet].every((v) => selectedValuesSet.has(v))
      ) {
        return;
      }

      const newFilters = selectFilterValues(
        browserFilters,
        browserFilter,
        selectedValues,
      );
      setBrowserFilters(newFilters);
    },
    [browserFilter, browserFilters, setBrowserFilters],
  );

  const onCompleteLoading = useCallback(async () => {}, []);

  if (values === undefined || browserFilters === undefined) {
    return undefined;
  }

  const selectedValues = browserFilter.selectedValues.map((value) =>
    SongUtils.convertSongMetadataValueToString(value),
  );

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
                const newFilters = changeFilterToOtherTag(
                  browserFilters,
                  browserFilter,
                  tag,
                );
                setBrowserFilters(newFilters);
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
        const newFilters = addFilterNext(
          browserFilters,
          browserFilter,
          availableTags[0],
        );
        setBrowserFilters(newFilters);
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
        const newFilters = removeFilter(browserFilters, browserFilter);
        setBrowserFilters(newFilters);
      },
    });
  }

  return {
    id: `${COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX}_${browserFilter.tag}`,
    values,
    selectedValues,
    header: convertSongMetadataTagToDisplayName(browserFilter.tag),
    contextMenuSections,
    isLoading: false,
    allowMultipleSelection: true,
    onSelectValues,
    onCompleteLoading,
  };
}
