import { listAllSongMetadataTags } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

import type {
	SongTableDeviceLayout,
	SongTableDeviceLayoutSort,
} from "../types/songTableTypes";

/** The superseded `sola:v1:device:songTableColumnLayout` shape. */
export type LegacySongTableColumnLayoutEntry = {
	widthFlex: number;
	sortOrder?: number;
	isSortDesc: boolean;
};

export type LegacySongTableColumnLayout = Record<
	string,
	LegacySongTableColumnLayoutEntry
>;

function isSongMetadataTag(value: number): value is Song_MetadataTag {
	return listAllSongMetadataTags().includes(value as Song_MetadataTag);
}

function buildSortList(
	entries: { tag: Song_MetadataTag; sortOrder?: number; isDesc: boolean }[],
): SongTableDeviceLayoutSort[] {
	return entries
		.filter((entry) => entry.sortOrder !== undefined && entry.sortOrder >= 0)
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
		.map((entry) => ({ tag: entry.tag, isDesc: entry.isDesc }));
}

/**
 * The superseded device key, from before workspace/device scoping split
 * layout into its own store. Object.keys gives back strings, so a stale key
 * surviving a tag's removal from the enum must be dropped rather than
 * coerced into a bogus tag.
 */
export function convertLegacySongTableColumnLayout(
	legacy: LegacySongTableColumnLayout,
): SongTableDeviceLayout {
	const widthFlexByTag: Partial<Record<Song_MetadataTag, number>> = {};
	const sortEntries: {
		tag: Song_MetadataTag;
		sortOrder?: number;
		isDesc: boolean;
	}[] = [];
	for (const key of Object.keys(legacy)) {
		const tag = Number(key);
		if (!isSongMetadataTag(tag)) {
			continue;
		}
		const entry = legacy[key];
		// A stored zero is not a width: importing it would render the
		// column at flex 0 instead of falling back to the default.
		if (entry.widthFlex > 0) {
			widthFlexByTag[tag] = entry.widthFlex;
		}
		sortEntries.push({
			tag,
			sortOrder: entry.sortOrder,
			isDesc: entry.isSortDesc,
		});
	}
	return { widthFlexByTag, sort: buildSortList(sortEntries) };
}

/** The workspace document's deprecated per-column width and sort, the fallback source when no legacy device key exists. */
export function buildDeviceLayoutFromServerColumns(
	columns: SongTableColumn[],
): SongTableDeviceLayout {
	const widthFlexByTag: Partial<Record<Song_MetadataTag, number>> = {};
	for (const column of columns) {
		// A stored zero is not a width: importing it would render the
		// column at flex 0 instead of falling back to the default.
		if (column.widthFlex > 0) {
			widthFlexByTag[column.tag] = column.widthFlex;
		}
	}
	const sortEntries = columns.map((column) => ({
		tag: column.tag,
		sortOrder: column.sortOrder,
		isDesc: column.isSortDesc,
	}));
	return { widthFlexByTag, sort: buildSortList(sortEntries) };
}

export type SongTableDeviceLayoutMigrationResult =
	| { status: "migrated"; layout: SongTableDeviceLayout }
	| { status: "failed" };

/**
 * Async so a server-only history is never raced by the default winning and
 * getting written first. A failed fetch resolves as "failed"
 * rather than throwing, so the caller can run on defaults without persisting
 * them.
 */
export async function migrateSongTableDeviceLayout(
	legacyLayout: LegacySongTableColumnLayout | undefined,
	fetchServerColumns: () => Promise<SongTableColumn[]>,
): Promise<SongTableDeviceLayoutMigrationResult> {
	if (legacyLayout !== undefined) {
		return {
			status: "migrated",
			layout: convertLegacySongTableColumnLayout(legacyLayout),
		};
	}
	try {
		const columns = await fetchServerColumns();
		return {
			status: "migrated",
			layout: buildDeviceLayoutFromServerColumns(columns),
		};
	} catch {
		return { status: "failed" };
	}
}
