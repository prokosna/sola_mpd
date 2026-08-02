import { clone } from "@bufbuild/protobuf";
import {
	type SongTableColumn,
	SongTableColumnSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";

import type { SongTableColumnLayout } from "../types/songTableTypes";
import { songTableColumnLayoutKeyForTag } from "./songTableColumnLayout";

/**
 * Overlays the device layout's width_flex onto a column list. Column width is
 * Device-owned in both SongTableState.columns and Search.columns contexts
 * (docs/design/state-scoping.md §6.1), so this single function backs both
 * call sites — only the sort handling differs between them, and that
 * difference is expressed at each call site rather than here.
 *
 * A column with no device entry keeps its existing width_flex so nothing
 * collapses to zero (e.g. before the device layout has ever been written).
 * Saved searches are now written with width_flex 0 on purpose, so a column
 * whose tag the device has never sized would otherwise arrive here as 0 and
 * render as a non-flexing fixed-width column; fall back to the default flex
 * instead.
 */
const DEFAULT_WIDTH_FLEX = 1;

export function applyDeviceColumnWidths(
	columns: SongTableColumn[],
	layout: SongTableColumnLayout,
): SongTableColumn[] {
	return columns.map((column) => {
		const entry = layout[songTableColumnLayoutKeyForTag(column.tag)];
		if (entry === undefined) {
			if (column.widthFlex !== 0) {
				return column;
			}
			const fallback = clone(SongTableColumnSchema, column);
			fallback.widthFlex = DEFAULT_WIDTH_FLEX;
			return fallback;
		}
		const updated = clone(SongTableColumnSchema, column);
		updated.widthFlex = entry.widthFlex;
		return updated;
	});
}
