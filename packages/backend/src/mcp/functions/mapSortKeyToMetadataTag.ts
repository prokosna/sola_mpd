import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

export type SearchSortKey =
	| "title"
	| "artist"
	| "album"
	| "date"
	| "added"
	| "updated";

/**
 * Maps a library_search `sort` argument to its Song_MetadataTag. Unknown or
 * undefined keys collapse to UNKNOWN, which MPD treats as "no sort".
 */
export function mapSortKeyToMetadataTag(
	key: SearchSortKey | undefined,
): Song_MetadataTag {
	switch (key) {
		case "title":
			return Song_MetadataTag.TITLE;
		case "artist":
			return Song_MetadataTag.ARTIST;
		case "album":
			return Song_MetadataTag.ALBUM;
		case "date":
			return Song_MetadataTag.DATE;
		case "added":
			return Song_MetadataTag.ADDED_AT;
		case "updated":
			return Song_MetadataTag.UPDATED_AT;
		default:
			return Song_MetadataTag.UNKNOWN;
	}
}
