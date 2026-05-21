import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import type { LibraryGroupableTag } from "../services/LibraryIndex.js";

export type SearchableTagName = LibraryGroupableTag | "title";

export function tagNameToMetadataTag(
	tagName: SearchableTagName,
): Song_MetadataTag {
	switch (tagName) {
		case "artist":
			return Song_MetadataTag.ARTIST;
		case "album_artist":
			return Song_MetadataTag.ALBUM_ARTIST;
		case "album":
			return Song_MetadataTag.ALBUM;
		case "genre":
			return Song_MetadataTag.GENRE;
		case "composer":
			return Song_MetadataTag.COMPOSER;
		case "label":
			return Song_MetadataTag.LABEL;
		case "title":
			return Song_MetadataTag.TITLE;
	}
}
