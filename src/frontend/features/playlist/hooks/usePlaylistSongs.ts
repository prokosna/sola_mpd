import { useEffect } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function usePlaylistSongs() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const currentPlaylist = useAppStore((state) => state.currentPlaylist);
  const playlistSongs = useAppStore((state) => state.playlistSongs);
  const pullPlaylistSongs = useAppStore((state) => state.pullPlaylistSongs);

  useEffect(() => {
    if (profile === undefined || currentPlaylist === undefined) {
      return;
    }
    pullPlaylistSongs(profile, currentPlaylist);
  }, [profile, currentPlaylist, pullPlaylistSongs]);

  return playlistSongs;
}
