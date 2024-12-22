import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { SongTableKey, SongTableKeyType } from "../types/songTableTypes";
import { getSongTableKey } from "../utils/tableUtils";

/**
 * Uses Key -> Song mapping.
 * @param songs Songs.
 * @param keyType Key type.
 * @returns Key -> Song mapping.
 */
export function useSongsMap(
  songs: Song[],
  keyType: SongTableKeyType,
): Map<SongTableKey, Song> {
  return useMemo(() => {
    return new Map(songs.map((song) => [getSongTableKey(song, keyType), song]));
  }, [keyType, songs]);
}
