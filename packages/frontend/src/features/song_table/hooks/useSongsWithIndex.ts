import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

export function useSongsWithIndex(songs: Song[]) {
  return useMemo(() => {
    return songs.map((song, index) => {
      song.index = index;
      return song;
    });
  }, [songs]);
}
