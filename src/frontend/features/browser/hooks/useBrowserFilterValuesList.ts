import { useEffect } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function useBrowserFilterValuesList() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const browserFilters = useAppStore((state) => state.browserFilters);
  const browserFilterValuesList = useAppStore(
    (state) => state.browserFilterValuesList,
  );
  const pullBrowserFilterValuesList = useAppStore(
    (state) => state.pullBrowserFilterValuesList,
  );

  useEffect(() => {
    if (profile === undefined || browserFilters === undefined) {
      return;
    }
    pullBrowserFilterValuesList(profile, browserFilters);
  }, [browserFilters, profile, pullBrowserFilterValuesList]);

  return browserFilterValuesList;
}
