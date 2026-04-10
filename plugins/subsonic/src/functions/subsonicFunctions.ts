import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

import type { SubsonicSong } from "../types.js";

const equal = (a: Song, b: SubsonicSong): boolean => {
	const title = getSongMetadataAsString(a, Song_MetadataTag.TITLE);
	const artist = getSongMetadataAsString(a, Song_MetadataTag.ARTIST);
	const album = getSongMetadataAsString(a, Song_MetadataTag.ALBUM);
	return b.title === title && b.artist === artist && b.album === album;
};

export const diffSongs = (
	targetSongs: Song[],
	existingSongs: SubsonicSong[],
): Song[] | undefined => {
	for (const [index, existingSong] of existingSongs.entries()) {
		if (index >= targetSongs.length) {
			return;
		}
		const targetSong = targetSongs[index];
		if (!equal(targetSong, existingSong)) {
			return;
		}
	}
	const toAddSongs: Song[] = [];
	for (const [index, targetSong] of targetSongs.entries()) {
		if (index >= existingSongs.length) {
			toAddSongs.push(targetSong);
		}
	}
	return toAddSongs;
};
