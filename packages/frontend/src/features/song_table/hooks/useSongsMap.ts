import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { getTableKeyOfSong } from "../helpers/table";
import { SongTableKeyType } from "../types/songTable";

export function useSongsMap(songs: Song[], keyType: SongTableKeyType) {
  return useMemo(() => {
    return new Map(
      songs.map((song) => [getTableKeyOfSong(song, keyType), song]),
    );
  }, [keyType, songs]);
}
