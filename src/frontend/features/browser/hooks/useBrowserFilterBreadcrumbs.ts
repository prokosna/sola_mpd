import equal from "fast-deep-equal";
import { produce } from "immer";
import { useCallback, useMemo } from "react";

import { useAppStore } from "../../global/store/AppStore";

import { SongMetadataTag, SongMetadataValue } from "@/models/song";
import { BrowserUtils } from "@/utils/BrowserUtils";

export type FilterBreadcrumb = {
  isPlaceholder: boolean;
  metadataTag: SongMetadataTag | undefined;
  metadataValue: SongMetadataValue;
};

export function useBrowserFilterBreadcrumbs() {
  const browserFilters = useAppStore((state) => state.browserFilters);
  const updateBrowserFilters = useAppStore(
    (state) => state.updateBrowserFilters,
  );

  const onCloseClicked = useCallback(
    async (tag: SongMetadataTag, value: SongMetadataValue) => {
      if (browserFilters === undefined) {
        return;
      }
      const filterIndex = browserFilters.findIndex((v) => v.tag === tag);
      if (filterIndex < 0) {
        console.warn("Filter not found");
        return;
      }

      const valueIndex = browserFilters[filterIndex].selectedValues.findIndex(
        (v) => equal(v, value),
      );
      if (valueIndex < 0) {
        console.warn("Selected value not found");
        return;
      }

      const newBrowserFilters = BrowserUtils.normalizeBrowserFilters(
        produce(browserFilters, (draft) => {
          draft[filterIndex].selectedValues.splice(valueIndex, 1);
        }),
      );

      await updateBrowserFilters(newBrowserFilters);
    },
    [browserFilters, updateBrowserFilters],
  );

  const onResetClicked = useCallback(async () => {
    if (browserFilters === undefined) {
      return;
    }
    const newBrowserFilters = BrowserUtils.normalizeBrowserFilters(
      produce(browserFilters, (draft) => {
        for (const filter of draft) {
          filter.selectedValues = [];
        }
      }),
    );
    await updateBrowserFilters(newBrowserFilters);
  }, [browserFilters, updateBrowserFilters]);

  const filterBreadcrumbsGroup = useMemo(() => {
    if (
      browserFilters === undefined ||
      browserFilters.every((v) => v.selectedValues.length <= 0)
    ) {
      return [];
    }
    const selectedFilterSorted = Array.from(browserFilters)
      .filter((v) => v.selectedValues.length > 0)
      .sort((a, b) => a.selectedOrder - b.selectedOrder);
    return selectedFilterSorted.map((v) => {
      return v.selectedValues.map((w) => ({
        isPlaceholder: false,
        metadataTag: v.tag,
        metadataValue: w,
      }));
    });
  }, [browserFilters]);

  return {
    filterBreadcrumbsGroup,
    onCloseClicked,
    onResetClicked,
  };
}
