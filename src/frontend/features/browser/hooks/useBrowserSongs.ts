import { useEffect } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function useBrowserSongs() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const browserSongs = useAppStore((state) => state.browserSongs);
  const browserFilters = useAppStore((state) => state.browserFilters);
  const pullBrowserSongs = useAppStore((state) => state.pullBrowserSongs);

  useEffect(() => {
    if (profile === undefined || browserFilters === undefined) {
      return;
    }
    pullBrowserSongs(profile, browserFilters);
  }, [profile, pullBrowserSongs, browserFilters]);

  return browserSongs;
}
