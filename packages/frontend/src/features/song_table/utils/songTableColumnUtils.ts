import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

export function getAverageWidthFlex(columns: SongTableColumn[]): number {
	const sum = columns
		.map((column) => column.widthFlex)
		.reduce((a, b) => a + b, 0);
	return Math.floor(sum / columns.length || 0);
}
