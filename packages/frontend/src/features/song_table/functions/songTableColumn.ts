import { clone, create } from "@bufbuild/protobuf";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { Column } from "ag-grid-community";

import { convertSongMetadataTagFromDisplayName } from "../utils/songTableTableUtils";

export function convertAgGridColumnsToSongTableColumns(
	agGridColumns: Column[],
): SongTableColumn[] {
	return agGridColumns
		.map((col) => {
			const sortOrder = col.getSortIndex();
			const isSortDesc = (() => {
				switch (col.getSort()) {
					case "asc":
						return false;
					case "desc":
						return true;
					default:
						return false;
				}
			})();
			const flex = Math.floor(col.getActualWidth());
			const tag = convertSongMetadataTagFromDisplayName(col.getColId());
			if (tag === undefined) {
				return undefined;
			}
			const column = create(SongTableColumnSchema, {
				tag,
				sortOrder: sortOrder != null ? sortOrder : undefined,
				isSortDesc,
				widthFlex: flex,
			});
			return column;
		})
		.filter((column) => column !== undefined);
}

export function copySortingAttributesToNewColumns(
	newColumns: SongTableColumn[],
	baseColumns: SongTableColumn[],
): SongTableColumn[] {
	return newColumns.map((column) => {
		for (const baseColumn of baseColumns) {
			if (column.tag === baseColumn.tag) {
				const newColumn = clone(SongTableColumnSchema, column);
				newColumn.isSortDesc = baseColumn.isSortDesc;
				newColumn.sortOrder = baseColumn.sortOrder;
				return newColumn;
			}
		}
		return column;
	});
}

export function normalizeSongTableColumns(
	columns: SongTableColumn[],
): SongTableColumn[] {
	const sorted = Array.from(
		columns.filter(
			(column) => column.sortOrder !== undefined && column.sortOrder >= 0,
		),
		// biome-ignore lint/style/noNonNullAssertion: Must not be null.
	).sort((a, b) => a.sortOrder! - b.sortOrder!);
	return columns.map((column) => {
		if (column.sortOrder !== undefined && column.sortOrder >= 0) {
			const normalized = clone(SongTableColumnSchema, column);
			normalized.sortOrder = sorted.findIndex((col) => col.tag === column.tag);
			return normalized;
		}
		return column;
	});
}

export function ensureTagsContainedInColumns(
	columns: SongTableColumn[],
	tags: Song_MetadataTag[],
	widthFlexInt: number,
): SongTableColumn[] {
	const result = [...columns];
	for (const tag of tags) {
		if (result.every((column) => column.tag !== tag)) {
			result.push(
				create(SongTableColumnSchema, {
					tag,
					widthFlex: widthFlexInt,
					isSortDesc: false,
				}),
			);
		}
	}
	return result;
}
