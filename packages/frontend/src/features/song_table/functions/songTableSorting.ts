import { compareSongsByMetadataValue } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { SongTableColumnView } from "../types/songTableTypes";

export function sortSongsByColumns(
	songs: Song[],
	columns: SongTableColumnView[],
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
