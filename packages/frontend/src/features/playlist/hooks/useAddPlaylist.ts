import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { useCallback } from "react";

import { MpdClient } from "../../mpd";
import { addPlaylist } from "../utils/playlistUtils";

/**
 * A custom hook for adding a playlist to the MPD server.
 *
 * @param mpdClient - Optional MpdClient instance for communicating with the MPD server.
 * @param mpdProfile - Optional MpdProfile containing connection details.
 * @returns A callback function that takes a Playlist object and adds it to the server.
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
