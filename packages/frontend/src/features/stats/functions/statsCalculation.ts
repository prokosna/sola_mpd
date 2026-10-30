import {
	getSongMetadataAsNumber,
	getSongMetadataAsString,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

export function getMetadataValueCountDistinct(
	songs: Song[],
	tag: Song_MetadataTag,
): number {
	return [...new Set(songs.map((song) => getSongMetadataAsString(song, tag)))]
		.length;
}

export function getSongsTotalDuration(songs: Song[]): number {
	return songs
		.map((song) => getSongMetadataAsNumber(song, Song_MetadataTag.DURATION))
		.filter((value) => value !== undefined)
		.reduce((total, value) => total + value, 0);
}
