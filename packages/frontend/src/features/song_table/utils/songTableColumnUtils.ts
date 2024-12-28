import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { Column } from "ag-grid-community";

import { convertSongMetadataTagFromDisplayName } from "./songTableTableUtils";

/**
 * Converts ag-grid columns to SongTableColumns.
 * @param agGridColumns ag-grid columns.
 * @returns SongTableColumns.
 */
export function convertAgGridColumnsToSongTableColumns(
  agGridColumns: Column[],
): SongTableColumn[] {
  return agGridColumns.map((col) => {
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
    const column = new SongTableColumn({
      tag: convertSongMetadataTagFromDisplayName(col.getColId()),
      sortOrder: sortOrder != null ? sortOrder : undefined,
      isSortDesc,
      widthFlex: flex,
    });
    return column;
  });
}

/**
 * Copies sorting attributes from baseColumns to newColumns
 * @param newColumns New columns
 * @param baseColumns Base columns.
 * @returns New columns.
 */
export function copySortingAttributesToNewColumns(
  newColumns: SongTableColumn[],
  baseColumns: SongTableColumn[],
): SongTableColumn[] {
  return newColumns.map((column) => {
    for (const baseColumn of baseColumns) {
      if (column.tag === baseColumn.tag) {
        const newColumn = column.clone();
        newColumn.isSortDesc = baseColumn.isSortDesc;
        newColumn.sortOrder = baseColumn.sortOrder;
        return newColumn;
      }
    }
    return column;
  });
}

/**
 * Normalizes given columns' sortOrder so that it starts from 0.
 * @param columns Columns to be normalized.
 * @returns Normalized columns
 */
export function normalizeSongTableColumns(
  columns: SongTableColumn[],
): SongTableColumn[] {
  const sorted = Array.from(
    columns.filter(
      (column) => column.sortOrder !== undefined && column.sortOrder >= 0,
    ),
  ).sort((a, b) => a.sortOrder! - b.sortOrder!);
  for (const column of columns) {
    if (column.sortOrder !== undefined && column.sortOrder >= 0) {
      column.sortOrder = sorted.findIndex((col) => col.tag === column.tag);
    }
  }
  return columns;
}

/**
 * Get average width in flex of given columns.
 * @param columns Columns.
 * @returns Average width in flex as an integer value.
 */
export function getAverageWidthFlex(columns: SongTableColumn[]): number {
  const sum = columns
    .map((column) => column.widthFlex)
    .reduce((a, b) => a + b, 0);
  return Math.floor(sum / columns.length || 0);
}

/**
 * Ensures that all given tags exist in a given columns. Add a new tag with widthFlexInt if not exist.
 * @param columns Columns.
 * @param tags Tags.
 * @param widthFlexInt Integer value represents width in flex.
 * @returns Updated columns.
 */
export function ensureTagsContainedInColumns(
  columns: SongTableColumn[],
  tags: Song_MetadataTag[],
  widthFlexInt: number,
): SongTableColumn[] {
  for (const tag of tags) {
    if (columns.every((column) => column.tag !== tag)) {
      columns.push(
        new SongTableColumn({
          tag,
          widthFlex: widthFlexInt,
          isSortDesc: false,
        }),
      );
    }
  }
  return columns;
}
