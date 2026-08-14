import { create } from "@bufbuild/protobuf";
import { SongTableColumnSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import {
	buildWidthFlexByTagFromColumnViews,
	diffSongTableColumns,
	type SongTableColumnView,
	songTableDeviceLayoutAtom,
	updateSongTableDeviceLayoutActionAtom,
} from "../../song_table";
import { setEditingSearchStatusActionAtom } from "../states/actions/setEditingSearchStatusActionAtom";
import { setSearchSongTableColumnsActionAtom } from "../states/actions/setSearchSongTableColumnsActionAtom";
import { searchColumnViewAtom } from "../states/atoms/searchColumnViewAtom";
import { EditingSearchStatus } from "../types/searchTypes";

// Saved-search column updates don't go through the library views' write path:
// a saved search's `tag`/sort are part of the search definition (Workspace),
// but `width_flex` is always Device, same as the common song table.
export function useHandleSearchColumnsUpdated() {
	const currentColumns = useAtomValue(searchColumnViewAtom);
	const deviceLayout = useAtomValue(songTableDeviceLayoutAtom);
	const setSearchSongTableColumns = useSetAtom(
		setSearchSongTableColumnsActionAtom,
	);
	const setEditingSearchStatus = useSetAtom(setEditingSearchStatusActionAtom);
	const updateSongTableDeviceLayout = useSetAtom(
		updateSongTableDeviceLayoutActionAtom,
	);

	return useCallback(
		(columns: SongTableColumnView[]) => {
			// Migration still pending: the device layout is not writable yet.
			if (deviceLayout === undefined || currentColumns === undefined) {
				return;
			}
			const diff = diffSongTableColumns(currentColumns, columns);

			if (diff.tagsChanged || diff.sortChanged) {
				// Search.columns never carries a meaningful width_flex:
				// readers always overlay the device value, so a stale width
				// here would just be ignored, but we keep it at 0 to be
				// explicit that it isn't the source of truth.
				const columnsForSearch = columns.map((column) =>
					create(SongTableColumnSchema, {
						tag: column.tag,
						sortOrder: column.sortOrder,
						isSortDesc: column.isSortDesc,
						widthFlex: 0,
					}),
				);
				setSearchSongTableColumns(columnsForSearch);
				setEditingSearchStatus(EditingSearchStatus.COLUMNS_UPDATED);
				return;
			}

			if (diff.widthChanged) {
				// Only the widths: this table's sort belongs to the saved search,
				// not to the device layout the common song table sorts by.
				updateSongTableDeviceLayout({
					widthFlexByTag: buildWidthFlexByTagFromColumnViews(columns),
				});
			}
		},
		[
			currentColumns,
			deviceLayout,
			setSearchSongTableColumns,
			setEditingSearchStatus,
			updateSongTableDeviceLayout,
		],
	);
}
