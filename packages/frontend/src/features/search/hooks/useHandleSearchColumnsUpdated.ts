import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import {
	buildDeviceSortFromColumnViews,
	buildWidthFlexByTagFromColumnViews,
	diffSongTableColumns,
	type SongTableColumnView,
	updateSongTableDeviceLayoutActionAtom,
} from "../../song_table";
import { updateSearchColumnTagsActionAtom } from "../states/actions/updateSearchColumnTagsActionAtom";
import { updateSearchSortActionAtom } from "../states/actions/updateSearchSortActionAtom";
import { searchColumnViewAtom } from "../states/atoms/searchColumnViewAtom";

// Routes an AG Grid column event to the right owner: a tag reorder/add/remove
// and the sort both belong to the saved search being edited, width is always
// device-owned — mirrors useHandleLibraryColumnsUpdated.
export function useHandleSearchColumnsUpdated() {
	const columns = useAtomValue(searchColumnViewAtom);
	const updateColumnTags = useSetAtom(updateSearchColumnTagsActionAtom);
	const updateSort = useSetAtom(updateSearchSortActionAtom);
	const updateDeviceLayout = useSetAtom(updateSongTableDeviceLayoutActionAtom);

	return useCallback(
		(updatedColumns: SongTableColumnView[]) => {
			const currentColumns = columns ?? [];
			const diff = diffSongTableColumns(currentColumns, updatedColumns);

			if (diff.tagsChanged) {
				updateColumnTags(updatedColumns.map((column) => column.tag));
				return;
			}

			if (diff.sortChanged) {
				updateSort(buildDeviceSortFromColumnViews(updatedColumns));
			}
			if (diff.widthChanged) {
				// Only the widths: this table's sort belongs to the saved search,
				// not to the device layout the common song table sorts by.
				updateDeviceLayout({
					widthFlexByTag: buildWidthFlexByTagFromColumnViews(updatedColumns),
				});
			}
		},
		[columns, updateColumnTags, updateSort, updateDeviceLayout],
	);
}
