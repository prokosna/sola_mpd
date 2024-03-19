import { useEffect } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function useFileExploreSongs() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const fileExploreSongs = useAppStore((state) => state.fileExploreSongs);
  const selectedFileExploreFolder = useAppStore(
    (state) => state.selectedFileExploreFolder,
  );
  const pullFileExploreSongs = useAppStore(
    (state) => state.pullFileExploreSongs,
  );

  useEffect(() => {
    if (profile === undefined || selectedFileExploreFolder === undefined) {
      return;
    }
    pullFileExploreSongs(profile, selectedFileExploreFolder);
  }, [profile, pullFileExploreSongs, selectedFileExploreFolder]);

  return fileExploreSongs;
}
