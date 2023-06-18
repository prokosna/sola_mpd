import { useEffect } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function usePlayQueueSongs() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const playQueueSongs = useAppStore((state) => state.playQueueSongs);
  const pullPlayQueueSongs = useAppStore((state) => state.pullPlayQueueSongs);

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullPlayQueueSongs(profile);
  }, [profile, pullPlayQueueSongs]);

  return playQueueSongs;
}
