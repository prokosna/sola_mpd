import { useCallback, useMemo } from "react";

import { useAppStore } from "../../global/store/AppStore";

import { BrowserState } from "@/models/browser";
import { SavedSearches } from "@/models/search";

export function useSettingStates() {
  const profileState = useAppStore((state) => state.profileState);
  const updateProfileState = useAppStore((state) => state.updateProfileState);
  const layoutState = useAppStore((state) => state.layoutState);
  const updateLayoutState = useAppStore((state) => state.updateLayoutState);
  const commonSongTableState = useAppStore(
    (state) => state.commonSongTableState
  );
  const updateCommonSongTableState = useAppStore(
    (state) => state.updateCommonSongTableState
  );
  const browserFilters = useAppStore((state) => state.browserFilters);
  const browserState = useMemo(() => {
    return BrowserState.create({ filters: browserFilters });
  }, [browserFilters]);
  const updateBrowserFilters = useAppStore(
    (state) => state.updateBrowserFilters
  );
  const updateBrowserState = useCallback(
    async (state: BrowserState) => {
      updateBrowserFilters(state.filters);
    },
    [updateBrowserFilters]
  );
  const searches = useAppStore((state) => state.savedSearches);
  const savedSearches = SavedSearches.create({ searches });
  const updateSearches = useAppStore((state) => state.updateSavedSearches);
  const updateSavedSearches = useCallback(
    async (searches: SavedSearches) => {
      updateSearches(searches.searches);
    },
    [updateSearches]
  );

  return {
    profileState,
    updateProfileState,
    layoutState,
    updateLayoutState,
    commonSongTableState,
    updateCommonSongTableState,
    browserState,
    updateBrowserState,
    savedSearches,
    updateSavedSearches,
  };
}
