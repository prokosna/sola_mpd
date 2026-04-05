import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
	convertAudioFormatToString,
	getSongMetadataAsString,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
	type Song_MetadataValue,
} from "@sola_mpd/shared/src/models/song_pb.js";
import dayjs from "dayjs";
import type { SongTableRowCompact } from "../types/songTableTypes";

export function convertSongMetadataTagToDisplayName(
	tag: Song_MetadataTag,
): string {
	return Song_MetadataTag[tag]
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function convertSongMetadataTagFromDisplayName(
	str: string,
): Song_MetadataTag | undefined {
	const tag = str
		.split(" ")
		.map((v) => v.toUpperCase())
		.join("_");
	return Song_MetadataTag[tag as keyof typeof Song_MetadataTag];
}

export function convertSongMetadataForGridRowValue(
	tag: Song_MetadataTag,
	value: Song_MetadataValue,
): [string, string | number | Date | undefined] {
	const v = (() => {
		switch (value.value.case) {
			case "stringValue":
				return value.value.value.value;
			case "floatValue":
				return value.value.value.value;
			case "intValue":
				return value.value.value.value;
			case "timestamp":
				return dayjs(timestampDate(value.value.value)).format("YYYY-MM-DD");
			case "format":
				return convertAudioFormatToString(value.value.value);
		}
	})();
	return [convertSongMetadataTagToDisplayName(tag), v];
}

export function convertSongForGridRowValueCompact(
	song: Song,
): SongTableRowCompact {
	const title = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
	const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
	const albumArtist = getSongMetadataAsString(
		song,
		Song_MetadataTag.ALBUM_ARTIST,
	);
	const composer = getSongMetadataAsString(song, Song_MetadataTag.COMPOSER);
	const album = getSongMetadataAsString(song, Song_MetadataTag.ALBUM);

	return {
		firstLine: title,
		secondLine: `${[album, artist ?? albumArtist ?? "-", composer].filter((v) => v !== "").join(" / ")}`,
	};
}
