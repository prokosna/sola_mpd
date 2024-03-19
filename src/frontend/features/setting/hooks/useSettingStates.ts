import { useCallback, useEffect, useMemo } from "react";

import { useAppStore } from "../../global/store/AppStore";

import { BrowserState } from "@/models/browser";
import { SavedSearches } from "@/models/search";

export function useSettingStates() {
  const profileState = useAppStore((state) => state.profileState);
  const updateProfileState = useAppStore((state) => state.updateProfileState);
  const pullProfileState = useAppStore((state) => state.pullProfileState);

  const layoutState = useAppStore((state) => state.layoutState);
  const updateLayoutState = useAppStore((state) => state.updateLayoutState);
  const pullLayoutState = useAppStore((state) => state.pullLayoutState);

  const commonSongTableState = useAppStore(
    (state) => state.commonSongTableState,
  );
  const updateCommonSongTableState = useAppStore(
    (state) => state.updateCommonSongTableState,
  );
  const pullCommonSongTableState = useAppStore(
    (state) => state.pullCommonSongTableState,
  );

  const browserFilters = useAppStore((state) => state.browserFilters);
  const updateBrowserFilters = useAppStore(
    (state) => state.updateBrowserFilters,
  );
  const pullBrowserFilters = useAppStore((state) => state.pullBrowserFilters);
  const browserState = useMemo(() => {
    return BrowserState.create({ filters: browserFilters });
  }, [browserFilters]);
  const updateBrowserState = useCallback(
    async (state: BrowserState) => {
      updateBrowserFilters(state.filters);
    },
    [updateBrowserFilters],
  );

  const searches = useAppStore((state) => state.savedSearches);
  const savedSearches = SavedSearches.create({ searches });
  const updateSearches = useAppStore((state) => state.updateSavedSearches);
  const updateSavedSearches = useCallback(
    async (searches: SavedSearches) => {
      updateSearches(searches.searches);
    },
    [updateSearches],
  );
  const pullSavedSearches = useAppStore((state) => state.pullSavedSearches);

  useEffect(() => {
    pullProfileState();
    pullLayoutState();
    pullCommonSongTableState();
    pullBrowserFilters();
    pullSavedSearches();
  }, [
    pullBrowserFilters,
    pullCommonSongTableState,
    pullLayoutState,
    pullProfileState,
    pullSavedSearches,
  ]);

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
