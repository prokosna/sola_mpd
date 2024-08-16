import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

export function useSongsWithIndex(songs: Song[]) {
  return songs.map((song, index) => {
    song.index = index;
    return song;
  });
}
