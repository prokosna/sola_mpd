import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import type { SongTableKey, SongTableKeyType } from "../types/songTableTypes";
import { getSongTableKey } from "../utils/songTableTableUtils";

/**
 * Creates a memoized map for song lookup by key.
 *
 * Maintains a mapping between song keys and song objects for
 * efficient lookup operations. Key type determines the song
 * property used as the lookup key.
 *
 * @param songs Song list
 * @param keyType Key type
 * @returns Song lookup map
 */
export function useSongsMap(
	songs: Song[],
	keyType: SongTableKeyType,
): Map<SongTableKey, Song> {
	return useMemo(() => {
		return new Map(songs.map((song) => [getSongTableKey(song, keyType), song]));
	}, [keyType, songs]);
}
