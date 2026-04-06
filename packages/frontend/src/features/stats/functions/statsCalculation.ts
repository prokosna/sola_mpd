import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type {
	Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

export function getMetadataValueCountDistinct(
	songs: Song[],
	tag: Song_MetadataTag,
): number {
	return [...new Set(songs.map((song) => getSongMetadataAsString(song, tag)))]
		.length;
}
