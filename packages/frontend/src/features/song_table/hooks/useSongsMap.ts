import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import { SongTableKeyType } from "../types/songTableTypes";
import { getTableKeyOfSong } from "../workflows/convertAgGridTableSongs";

export function useSongsMap(songs: Song[], keyType: SongTableKeyType) {
  return new Map(songs.map((song) => [getTableKeyOfSong(song, keyType), song]));
}
