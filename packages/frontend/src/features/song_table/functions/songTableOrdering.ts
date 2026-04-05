import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import type { SongTableKeyType } from "../types/songTableTypes";
import { getSongTableKey } from "./songTableKey";

export function convertOrderingToOperations(
	currentSongs: Song[],
	orderedSongs: Song[],
	keyType: SongTableKeyType,
): {
	id: string;
	to: number;
}[] {
	const ops: { id: string; to: number }[] = [];
	orderedSongs.forEach((orderedSong, index) => {
		const currentSong = currentSongs[index];
		const currentSongKey = getSongTableKey(currentSong, keyType);
		const orderedSongKey = getSongTableKey(orderedSong, keyType);
		if (currentSongKey !== orderedSongKey) {
			ops.push({
				id: getSongMetadataAsString(orderedSong, Song_MetadataTag.ID),
				to: index,
			});
		}
	});
	return ops;
}
