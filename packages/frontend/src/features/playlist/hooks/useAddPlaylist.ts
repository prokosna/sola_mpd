import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { useCallback } from "react";

import { MpdClient } from "../../mpd";
import { addPlaylist } from "../utils/playlistUtils";

/**
 * Hook for adding playlists to MPD server.
 *
 * @param mpdClient Optional client instance
 * @param mpdProfile Optional connection details
 * @returns Callback for adding playlist
 */
export function useAddPlaylist(mpdClient?: MpdClient, mpdProfile?: MpdProfile) {
  return useCallback(
    (playlist: Playlist) => {
      if (mpdProfile === undefined || mpdClient === undefined) {
        return;
      }
      return addPlaylist(mpdClient, mpdProfile, playlist);
    },
    [mpdClient, mpdProfile],
  );
}
