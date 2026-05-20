import {
	convertAudioFormatToString,
	getSongMetadataAsAudioFormat,
	getSongMetadataAsStringOrEmpty,
	getSongMetadataAsTimestampMs,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";

// `IndexedSongRow` is the wire shape consumed by better-sqlite3 named binds.
// SQLite represents missing values as SQL NULL, which better-sqlite3 binds
// from / returns as JavaScript `null` (passing `undefined` for a parameter
// raises). Keep `| null` on this internal row type so the SQL boundary stays
// honest; codebase-wide `undefined` shows up at the port surface above.
export type IndexedSongRow = {
	path: string;
	title: string;
	artist: string;
	album_artist: string;
	album: string;
	genre: string;
	composer: string;
	label: string;
	date: string;
	year: number | null;
	format: string;
	duration_seconds: number | null;
	added_at_ms: number | null;
	updated_at_ms: number | null;
};

function readDuration(song: Song): number | undefined {
	const value = song.metadata[Song_MetadataTag.DURATION];
	if (value === undefined || value.value.case !== "floatValue") {
		return undefined;
	}
	const seconds = value.value.value.value;
	if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
		return undefined;
	}
	return seconds;
}

function readYear(date: string): number | undefined {
	if (date === "") {
		return undefined;
	}
	const match = date.match(/(\d{4})/);
	if (match === null) {
		return undefined;
	}
	const year = Number(match[1]);
	return Number.isFinite(year) ? year : undefined;
}

function readFormat(song: Song): string {
	const format = getSongMetadataAsAudioFormat(song, Song_MetadataTag.FORMAT);
	return format === undefined ? "" : convertAudioFormatToString(format);
}

/**
 * Pure function that flattens a `Song` into a row suitable for the analytical
 * mirror. The output is normalized: missing string tags collapse to "" and
 * missing numeric/timestamp tags to null (SQL NULL) so SQLite groups them
 * correctly.
 */
export function songToRow(song: Song): IndexedSongRow {
	const s = (tag: Song_MetadataTag) =>
		getSongMetadataAsStringOrEmpty(song, tag);
	const date = s(Song_MetadataTag.DATE);
	return {
		path: song.path,
		title: s(Song_MetadataTag.TITLE),
		artist: s(Song_MetadataTag.ARTIST),
		album_artist: s(Song_MetadataTag.ALBUM_ARTIST),
		album: s(Song_MetadataTag.ALBUM),
		genre: s(Song_MetadataTag.GENRE),
		composer: s(Song_MetadataTag.COMPOSER),
		label: s(Song_MetadataTag.LABEL),
		date,
		year: readYear(date) ?? null,
		format: readFormat(song),
		duration_seconds: readDuration(song) ?? null,
		added_at_ms:
			getSongMetadataAsTimestampMs(song, Song_MetadataTag.ADDED_AT) ?? null,
		updated_at_ms:
			getSongMetadataAsTimestampMs(song, Song_MetadataTag.UPDATED_AT) ?? null,
	};
}
