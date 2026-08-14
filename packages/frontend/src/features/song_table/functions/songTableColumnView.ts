import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

import { DEFAULT_COLUMN_WIDTH_FLEX } from "../const/songTableDefaults";
import type {
	SongTableColumnView,
	SongTableDeviceLayout,
	SongTableDeviceLayoutSort,
} from "../types/songTableTypes";

/**
 * Library views: tag order and set come from the workspace, sort and width
 * from the device. Never reads width_flex/sort_order off a workspace
 * document — a tag with no device entry gets the default width, which is
 * what makes the R3 reset land on the app default (DESIGN.md §6).
 */
export function composeSongTableColumnView(
	tags: Song_MetadataTag[],
	deviceLayout: SongTableDeviceLayout,
): SongTableColumnView[] {
	return tags.map((tag) => {
		const sortIndex = deviceLayout.sort.findIndex((entry) => entry.tag === tag);
		const sortEntry = sortIndex >= 0 ? deviceLayout.sort[sortIndex] : undefined;
		return {
			tag,
			widthFlex: deviceLayout.widthFlexByTag[tag] ?? DEFAULT_COLUMN_WIDTH_FLEX,
			sortOrder: sortEntry !== undefined ? sortIndex : undefined,
			isSortDesc: sortEntry?.isDesc ?? false,
		};
	});
}

/**
 * Search: tag and sort come from the saved search's own (still deprecated,
 * pre-step-7) `columns` field; only width is device-owned, same as every
 * other view.
 */
export function composeSearchSongTableColumnView(
	columns: SongTableColumn[],
	deviceLayout: SongTableDeviceLayout,
): SongTableColumnView[] {
	return columns.map((column) => ({
		tag: column.tag,
		widthFlex:
			deviceLayout.widthFlexByTag[column.tag] ?? DEFAULT_COLUMN_WIDTH_FLEX,
		sortOrder: column.sortOrder,
		isSortDesc: column.isSortDesc,
	}));
}

export function buildDeviceSortFromColumnViews(
	columns: SongTableColumnView[],
): SongTableDeviceLayoutSort[] {
	return columns
		.filter((column) => column.sortOrder !== undefined && column.sortOrder >= 0)
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
		.map((column) => ({ tag: column.tag, isDesc: column.isSortDesc }));
}

export function buildWidthFlexByTagFromColumnViews(
	columns: SongTableColumnView[],
): Partial<Record<Song_MetadataTag, number>> {
	const widthFlexByTag: Partial<Record<Song_MetadataTag, number>> = {};
	for (const column of columns) {
		widthFlexByTag[column.tag] = column.widthFlex;
	}
	return widthFlexByTag;
}
