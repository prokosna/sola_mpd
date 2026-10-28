import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import {
	displayDuration,
	normalize,
} from "@sola_mpd/shared/src/utils/stringUtils.js";

/** Loose enough to accept both a `SongTableColumnView[]` and a saved search's `SongTableColumn[]`. */
type GlobalFilterTargetColumn = { tag: Song_MetadataTag };

// Any whitespace separates tokens, so rows copied from a song table, which are
// tab-separated, can be pasted into the filter as they are.
export function convertGlobalFilterTextToTokens(text: string): string[] {
	return text
		.split(/\s+/)
		.filter((v) => v !== "")
		.map((v) => v.toLowerCase());
}

// Match what the song table shows, so text copied from it filters back to it.
function convertSongMetadataValueToDisplayString(
	song: Song,
	tag: Song_MetadataTag,
): string {
	const value = song.metadata[tag];
	if (tag === Song_MetadataTag.TIME && value?.value.case === "floatValue") {
		return displayDuration(value.value.value.value);
	}
	return convertSongMetadataValueToString(value);
}

function getSongRepresentation(
	song: Song,
	targetColumns: GlobalFilterTargetColumn[],
): string {
	let representation = "";
	for (const column of targetColumns) {
		const metadataValue = convertSongMetadataValueToDisplayString(
			song,
			column.tag,
		);
		representation += `${normalize(metadataValue)} `;
	}
	return representation;
}

export function includesToken(
	song: Song,
	filterTokens: string[],
	targetColumns: GlobalFilterTargetColumn[],
): boolean {
	const representation = getSongRepresentation(song, targetColumns);
	return filterTokens.every((token) => representation.includes(token));
}

export function filterSongsByGlobalFilter(
	songs: Song[],
	filterTokens: string[],
	targetColumns: GlobalFilterTargetColumn[],
): Song[] {
	if (filterTokens.length === 0) {
		return songs;
	}
	return songs.filter((song) =>
		includesToken(song, filterTokens, targetColumns),
	);
}

export function filterStringsByGlobalFilter(
	strings: string[],
	shouldInclude: string[],
	filterTokens: string[],
): string[] {
	if (filterTokens.length === 0) {
		return strings;
	}
	return strings.filter((str) => {
		const representation = normalize(str);
		return (
			shouldInclude.includes(str) ||
			filterTokens.every((filterToken) => representation.includes(filterToken))
		);
	});
}
