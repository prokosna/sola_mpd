import { compareSongsByMetadataValue } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

export function sortSongsByColumns(
	songs: Song[],
	columns: SongTableColumn[],
	collator: Intl.Collator,
): Song[] {
	const conditions = columns
		.filter((column) => (column.sortOrder ?? -1) >= 0)
		// biome-ignore lint/style/noNonNullAssertion: Must not be null.
		.sort((a, b) => a.sortOrder! - b.sortOrder!);
	return [...songs].sort((a, b) => {
		for (const condition of conditions) {
			const comp = compareSongsByMetadataValue(a, b, condition.tag, collator);
			if (comp !== 0) {
				return condition.isSortDesc ? -comp : comp;
			}
		}
		return 0;
	});
}
