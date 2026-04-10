import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { normalize } from "@sola_mpd/shared/src/utils/stringUtils.js";

function getSongRepresentation(
	song: Song,
	targetColumns: SongTableColumn[],
): string {
	let representation = "";
	for (const column of targetColumns) {
		const metadataValue = convertSongMetadataValueToString(
			song.metadata[column.tag],
		);
		representation += `${normalize(metadataValue)} `;
	}
	return representation;
}

export function includesToken(
	song: Song,
	filterTokens: string[],
	targetColumns: SongTableColumn[],
): boolean {
	const representation = getSongRepresentation(song, targetColumns);
	return filterTokens.every((token) => representation.includes(token));
}

export function filterSongsByGlobalFilter(
	songs: Song[],
	filterTokens: string[],
	targetColumns: SongTableColumn[],
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
