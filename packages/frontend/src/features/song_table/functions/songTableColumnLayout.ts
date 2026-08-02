import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

import type { SongTableColumnLayout } from "../types/songTableTypes";

/** Key used by `SongTableColumnLayout`, shared by every reader/writer so the same tag always round-trips to the same key. */
export function songTableColumnLayoutKeyForTag(tag: Song_MetadataTag): string {
	return String(tag);
}

/**
 * Builds a device layout from a full column list, capturing each column's
 * sort_order/is_sort_desc/width_flex. Used both by the one-time server->device
 * migration and by the update paths that persist a fresh device layout after
 * an AG Grid column event.
 */
export function buildSongTableColumnLayout(
	columns: SongTableColumn[],
): SongTableColumnLayout {
	const layout: SongTableColumnLayout = {};
	for (const column of columns) {
		layout[songTableColumnLayoutKeyForTag(column.tag)] = {
			widthFlex: column.widthFlex,
			sortOrder: column.sortOrder,
			isSortDesc: column.isSortDesc,
		};
	}
	return layout;
}
