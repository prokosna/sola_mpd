import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useMemo } from "react";
import { getSongTableKey } from "../functions/songTableKey";
import type { SongTableKey, SongTableKeyType } from "../types/songTableTypes";

export function useSongsMap(
	songs: Song[],
	keyType: SongTableKeyType,
): Map<SongTableKey, Song> {
	return useMemo(() => {
		return new Map(songs.map((song) => [getSongTableKey(song, keyType), song]));
	}, [keyType, songs]);
}
