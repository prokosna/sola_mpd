import {
	convertAudioFormatToString,
	getSongMetadataAsAudioFormat,
	getSongMetadataAsNumber,
	getSongMetadataAsStringOrEmpty,
	getSongMetadataAsTimestampMs,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

export type SongOutput = {
	path: string;
	title: string;
	artist: string;
	album_artist: string;
	album: string;
	genre: string;
	composer: string;
	track: number | null;
	disc: number | null;
	date: string;
	duration_seconds: number | null;
	format: string;
	added_at: string | null;
	updated_at: string | null;
	label: string;
	comment: string;
};

function metadataNumber(song: Song, tag: Song_MetadataTag): number | null {
	if (song.metadata[tag] === undefined) {
		return null;
	}
	const parsed = getSongMetadataAsNumber(song, tag);
	return parsed === undefined || Number.isNaN(parsed) ? null : parsed;
}

function metadataTimestampIso(
	song: Song,
	tag: Song_MetadataTag,
): string | null {
	const ms = getSongMetadataAsTimestampMs(song, tag);
	return ms === undefined ? null : new Date(ms).toISOString();
}

function metadataFormatString(song: Song, tag: Song_MetadataTag): string {
	const format = getSongMetadataAsAudioFormat(song, tag);
	return format === undefined ? "" : convertAudioFormatToString(format);
}

/**
 * Converts a Song protobuf message into a flat, LLM-friendly object.
 * Tag values come back as plain strings/numbers rather than the nested
 * MetadataValue oneof so that tool output is directly inspectable.
 */
export function songToOutput(song: Song): SongOutput {
	const s = (tag: Song_MetadataTag) =>
		getSongMetadataAsStringOrEmpty(song, tag);
	return {
		path: song.path,
		title: s(Song_MetadataTag.TITLE),
		artist: s(Song_MetadataTag.ARTIST),
		album_artist: s(Song_MetadataTag.ALBUM_ARTIST),
		album: s(Song_MetadataTag.ALBUM),
		genre: s(Song_MetadataTag.GENRE),
		composer: s(Song_MetadataTag.COMPOSER),
		track: metadataNumber(song, Song_MetadataTag.TRACK),
		disc: metadataNumber(song, Song_MetadataTag.DISC),
		date: s(Song_MetadataTag.DATE),
		duration_seconds: metadataNumber(song, Song_MetadataTag.DURATION),
		format: metadataFormatString(song, Song_MetadataTag.FORMAT),
		added_at: metadataTimestampIso(song, Song_MetadataTag.ADDED_AT),
		updated_at: metadataTimestampIso(song, Song_MetadataTag.UPDATED_AT),
		label: s(Song_MetadataTag.LABEL),
		comment: s(Song_MetadataTag.COMMENT),
	};
}
