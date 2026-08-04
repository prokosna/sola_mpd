import { clone } from "@bufbuild/protobuf";
import {
	type SongTableColumn,
	SongTableColumnSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import {
	applyDeviceColumnWidths,
	buildSongTableColumnLayout,
	diffSongTableColumns,
	songTableColumnLayoutAtom,
	songTableStateAtom,
	updateSongTableColumnLayoutActionAtom,
} from "../../song_table";
import { setEditingSearchStatusActionAtom } from "../states/actions/setEditingSearchStatusActionAtom";
import { setSearchSongTableColumnsActionAtom } from "../states/actions/setSearchSongTableColumnsActionAtom";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";
import { EditingSearchStatus } from "../types/searchTypes";

// Saved-search column updates don't go through updateSongTableStateActionAtom:
// a saved search's `tag`/sort are part of the search definition (Workspace),
// but `width_flex` is always Device, same as the common song table.
export function useHandleSearchColumnsUpdated() {
	const searchSongTableColumns = useAtomValue(searchSongTableColumnsAtom);
	const songTableState = useAtomValue(songTableStateAtom);
	const songTableColumnLayout = useAtomValue(songTableColumnLayoutAtom);
	const setSearchSongTableColumns = useSetAtom(
		setSearchSongTableColumnsActionAtom,
	);
	const setEditingSearchStatus = useSetAtom(setEditingSearchStatusActionAtom);
	const updateSongTableColumnLayout = useSetAtom(
		updateSongTableColumnLayoutActionAtom,
	);

	return useCallback(
		(columns: SongTableColumn[]) => {
			const baseColumns =
				searchSongTableColumns.length !== 0
					? searchSongTableColumns
					: (songTableState?.columns ?? []);
			const currentColumns = applyDeviceColumnWidths(
				baseColumns,
				songTableColumnLayout,
			);
			const diff = diffSongTableColumns(currentColumns, columns);

			if (diff.tagsChanged || diff.sortChanged) {
				// Search.columns never carries a meaningful width_flex:
				// readers always overlay the device value, so a stale width
				// here would just be ignored, but we keep it at 0 to be
				// explicit that it isn't the source of truth.
				const columnsForSearch = columns.map((column) => {
					const withoutWidth = clone(SongTableColumnSchema, column);
					withoutWidth.widthFlex = 0;
					return withoutWidth;
				});
				setSearchSongTableColumns(columnsForSearch);
				setEditingSearchStatus(EditingSearchStatus.COLUMNS_UPDATED);
				return;
			}

			if (diff.widthChanged) {
				updateSongTableColumnLayout(buildSongTableColumnLayout(columns));
			}
		},
		[
			searchSongTableColumns,
			songTableState,
			songTableColumnLayout,
			setSearchSongTableColumns,
			setEditingSearchStatus,
			updateSongTableColumnLayout,
		],
	);
}
