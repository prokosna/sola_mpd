import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import { DEFAULT_COLUMN_WIDTH_FLEX } from "../const/songTableDefaults";
import type {
	SongTableColumnView,
	SongTableDeviceLayoutSort,
} from "../types/songTableTypes";

/**
 * Shared by library views and Search; `overrideWidthFlexByTag` is a saved
 * search's own widths, tried before the shared map. A tag absent from every
 * map gets the default, not a stored value — what lets a reset land there.
 */
export function composeSongTableColumnView(
	tags: Song_MetadataTag[],
	widthFlexByTag: Partial<Record<Song_MetadataTag, number>>,
	sort: SongTableDeviceLayoutSort[],
	overrideWidthFlexByTag?: Partial<Record<Song_MetadataTag, number>>,
): SongTableColumnView[] {
	return tags.map((tag) => {
		const sortIndex = sort.findIndex((entry) => entry.tag === tag);
		const sortEntry = sortIndex >= 0 ? sort[sortIndex] : undefined;
		return {
			tag,
			widthFlex:
				overrideWidthFlexByTag?.[tag] ??
				widthFlexByTag[tag] ??
				DEFAULT_COLUMN_WIDTH_FLEX,
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
