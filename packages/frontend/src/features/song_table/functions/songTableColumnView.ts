import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import { DEFAULT_COLUMN_WIDTH_FLEX } from "../const/songTableDefaults";
import type {
	SongTableColumnView,
	SongTableDeviceLayoutSort,
} from "../types/songTableTypes";

/**
 * Shared by library views and Search, which differ only in where the tag
 * order and sort come from. A tag with no width entry always gets the
 * default rather than falling back to a stored value, which is what makes a
 * device reset land on the app default rather than a per-user value.
 */
export function composeSongTableColumnView(
	tags: Song_MetadataTag[],
	widthFlexByTag: Partial<Record<Song_MetadataTag, number>>,
	sort: SongTableDeviceLayoutSort[],
): SongTableColumnView[] {
	return tags.map((tag) => {
		const sortIndex = sort.findIndex((entry) => entry.tag === tag);
		const sortEntry = sortIndex >= 0 ? sort[sortIndex] : undefined;
		return {
			tag,
			widthFlex: widthFlexByTag[tag] ?? DEFAULT_COLUMN_WIDTH_FLEX,
			sortOrder: sortEntry !== undefined ? sortIndex : undefined,
			isSortDesc: sortEntry?.isDesc ?? false,
		};
	});
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
