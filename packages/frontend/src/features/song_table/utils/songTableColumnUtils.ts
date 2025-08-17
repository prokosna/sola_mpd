import { clone, create } from "@bufbuild/protobuf";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SongTableColumnSchema } from "@sola_mpd/domain/src/models/song_table_pb.js";
import type { Column } from "ag-grid-community";

import { convertSongMetadataTagFromDisplayName } from "./songTableTableUtils";

/**
 * Converts AG Grid columns to SongTableColumn format.
 *
 * Extracts column configuration from AG Grid's internal format,
 * preserving sort order, direction, and width settings.
 *
 * @param agGridColumns AG Grid column list
 * @returns SongTableColumn list
 */
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

/**
 * Preserves sorting configuration during column updates.
 *
 * Copies sort order and direction from base columns to new
 * columns while maintaining other updated properties.
 *
 * @param newColumns Updated column list
 * @param baseColumns Reference column list
 * @returns Merged column list
 */
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

/**
 * Normalizes column sort order sequence.
 *
 * Ensures sort order values start from 0 and increment
 * sequentially, maintaining relative order of sorted
 * columns.
 *
 * @param columns Column list to normalize
 * @returns Normalized column list
 */
export function normalizeSongTableColumns(
	columns: SongTableColumn[],
): SongTableColumn[] {
	const sorted = Array.from(
		columns.filter(
			(column) => column.sortOrder !== undefined && column.sortOrder >= 0,
		),
		// biome-ignore lint/style/noNonNullAssertion: Must not be null.
	).sort((a, b) => a.sortOrder! - b.sortOrder!);
	for (const column of columns) {
		if (column.sortOrder !== undefined && column.sortOrder >= 0) {
			column.sortOrder = sorted.findIndex((col) => col.tag === column.tag);
		}
	}
	return columns;
}

/**
 * Calculates average column width.
 *
 * Computes the mean flex width value across all columns,
 * rounded to nearest integer for consistent sizing.
 *
 * @param columns Column list
 * @returns Average flex width
 */
export function getAverageWidthFlex(columns: SongTableColumn[]): number {
	const sum = columns
		.map((column) => column.widthFlex)
		.reduce((a, b) => a + b, 0);
	return Math.floor(sum / columns.length || 0);
}

/**
 * Ensures required tags exist in column list.
 *
 * Adds missing tag columns with specified width, preserving
 * existing columns. Used to maintain required metadata
 * visibility.
 *
 * @param columns Current column list
 * @param tags Required tag list
 * @param widthFlexInt Default column width
 * @returns Updated column list
 */
export function ensureTagsContainedInColumns(
	columns: SongTableColumn[],
	tags: Song_MetadataTag[],
	widthFlexInt: number,
): SongTableColumn[] {
	for (const tag of tags) {
		if (columns.every((column) => column.tag !== tag)) {
			columns.push(
				create(SongTableColumnSchema, {
					tag,
					widthFlex: widthFlexInt,
					isSortDesc: false,
				}),
			);
		}
	}
	return columns;
}
