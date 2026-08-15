import type { Column } from "ag-grid-community";

import type { SongTableColumnView } from "../types/songTableTypes";
import { convertSongMetadataTagFromDisplayName } from "./songTableConversion";

export function convertAgGridColumnsToSongTableColumnViews(
	agGridColumns: Column[],
): SongTableColumnView[] {
	return agGridColumns
		.map((col): SongTableColumnView | undefined => {
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
			return {
				tag,
				sortOrder: sortOrder != null ? sortOrder : undefined,
				isSortDesc,
				widthFlex: flex,
			};
		})
		.filter((column) => column !== undefined);
}

export function copySortingAttributesToNewColumns(
	newColumns: SongTableColumnView[],
	baseColumns: SongTableColumnView[],
): SongTableColumnView[] {
	return newColumns.map((column) => {
		const baseColumn = baseColumns.find((base) => base.tag === column.tag);
		if (baseColumn === undefined) {
			return column;
		}
		return {
			...column,
			sortOrder: baseColumn.sortOrder,
			isSortDesc: baseColumn.isSortDesc,
		};
	});
}
