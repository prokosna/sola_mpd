import { clone } from "@bufbuild/protobuf";
import {
	type SongTableColumn,
	SongTableColumnSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";

import type { SongTableColumnLayout } from "../types/songTableTypes";
import { songTableColumnLayoutKeyForTag } from "./songTableColumnLayout";

const DEFAULT_WIDTH_FLEX = 1;

/**
 * Saved searches are written with width_flex 0, so a tag this device has never
 * sized would render as a fixed-width column. Fall back to the default flex.
 */
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
