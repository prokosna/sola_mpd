import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

/**
 * Uses songs with its index field filled by the incremental index.
 * @param songs Songs.
 * @returns Songs with the index field filled.
 */
export function useSongsWithIndex(songs: Song[]): Song[] {
  return useMemo(() => {
    return songs.map((song, index) => {
      song.index = index;
      return song;
    });
  }, [songs]);
}
