import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";

import type { SongTableColumnView } from "../types/songTableTypes";
import { convertSongMetadataForGridRowValue } from "./songTableConversion";

function convertSongMetadataToClipboardCell(
	song: Song,
	tag: Song_MetadataTag,
): string {
	const metadata = song.metadata[tag];
	if (metadata === undefined) {
		return "";
	}
	const [, value] = convertSongMetadataForGridRowValue(tag, metadata);
	if (value === undefined) {
		return "";
	}
	const text =
		tag === Song_MetadataTag.TIME && typeof value === "number"
			? displayDuration(value)
			: String(value);
	// Tabs and newlines would split the cell when pasted into a spreadsheet.
	return text.replace(/[\t\r\n]+/g, " ");
}

export function convertSongsToTsv(
	songs: Song[],
	columns: SongTableColumnView[],
): string {
	return songs
		.map((song) =>
			columns
				.map((column) => convertSongMetadataToClipboardCell(song, column.tag))
				.join("\t"),
		)
		.join("\n");
}
