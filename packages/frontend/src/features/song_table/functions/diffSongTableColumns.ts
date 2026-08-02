import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

export type SongTableColumnDiff = {
	tagsChanged: boolean;
	sortChanged: boolean;
	widthChanged: boolean;
};

/**
 * Classifies what changed between two column lists so callers can route the
 * write to the right layer (see docs/design/state-scoping.md §6.1/§14.3(c)):
 * `tag` (and its order) is Workspace, `sort_order`/`is_sort_desc`/`width_flex`
 * are Device in the common song table context.
 *
 * `tagsChanged` covers both membership and order — reordering without adding
 * or removing anything still counts, since the array order itself is the
 * column layout. `sortChanged`/`widthChanged` compare by tag, not index, so a
 * pure reorder never spuriously reports a sort or width change.
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
