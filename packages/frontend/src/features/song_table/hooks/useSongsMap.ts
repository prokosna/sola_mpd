import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { SongTableKeyType } from "../types/songTable";
import { getTableKeyOfSong } from "../utils/songTable";

export function useSongsMap(songs: Song[], keyType: SongTableKeyType) {
  return useMemo(() => {
    return new Map(
      songs.map((song) => [getTableKeyOfSong(song, keyType), song]),
    );
  }, [keyType, songs]);
}
