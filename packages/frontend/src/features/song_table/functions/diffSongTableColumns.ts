import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

export type SongTableColumnDiff = {
	tagsChanged: boolean;
	sortChanged: boolean;
	widthChanged: boolean;
};

/**
 * `tagsChanged` covers membership and order alike, since the array order is
 * itself the column layout. `sortChanged`/`widthChanged` compare by tag, not
 * index, so a pure reorder never reports a spurious sort or width change.
 */
export function diffSongTableColumns(
	prev: SongTableColumn[],
	next: SongTableColumn[],
): SongTableColumnDiff {
	const tagsChanged =
		prev.length !== next.length ||
		prev.some((column, index) => column.tag !== next[index]?.tag);

	let sortChanged = false;
	let widthChanged = false;
	for (const nextColumn of next) {
		const prevColumn = prev.find((column) => column.tag === nextColumn.tag);
		if (prevColumn === undefined) {
			// Additions/removals are already captured by tagsChanged.
			continue;
		}
		if (
			prevColumn.sortOrder !== nextColumn.sortOrder ||
			prevColumn.isSortDesc !== nextColumn.isSortDesc
		) {
			sortChanged = true;
		}
		if (prevColumn.widthFlex !== nextColumn.widthFlex) {
			widthChanged = true;
		}
	}

	return { tagsChanged, sortChanged, widthChanged };
}
