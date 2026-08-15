import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { diffSongTableColumns } from "../functions/diffSongTableColumns";
import {
	buildDeviceSortFromColumnViews,
	buildWidthFlexByTagFromColumnViews,
} from "../functions/songTableColumnView";
import { updateSongTableColumnTagsActionAtom } from "../states/actions/updateSongTableColumnTagsActionAtom";
import { updateSongTableDeviceLayoutActionAtom } from "../states/actions/updateSongTableDeviceLayoutActionAtom";
import { songTableColumnViewAtom } from "../states/atoms/songTableColumnViewAtom";
import type { SongTableColumnView } from "../types/songTableTypes";

/**
 * Routes an AG Grid column event to the right owner: a tag reorder/add/remove
 * is the shared workspace column set, sort and width are
 * device-owned. Shared by every library view; Search has its own routing in
 * useHandleSearchColumnsUpdated, since its sort belongs to the saved search.
 */
export function useHandleLibraryColumnsUpdated(): (
	updatedColumns: SongTableColumnView[],
) => Promise<void> {
	const columns = useAtomValue(songTableColumnViewAtom);
	const updateColumnTags = useSetAtom(updateSongTableColumnTagsActionAtom);
	const updateDeviceLayout = useSetAtom(updateSongTableDeviceLayoutActionAtom);

	return useCallback(
		async (updatedColumns: SongTableColumnView[]) => {
			const currentColumns = columns ?? [];
			const diff = diffSongTableColumns(currentColumns, updatedColumns);

			if (diff.tagsChanged) {
				await updateColumnTags(updatedColumns.map((column) => column.tag));
				return;
			}

			if (diff.sortChanged) {
				updateDeviceLayout({
					sort: buildDeviceSortFromColumnViews(updatedColumns),
				});
			}
			if (diff.widthChanged) {
				updateDeviceLayout({
					widthFlexByTag: buildWidthFlexByTagFromColumnViews(updatedColumns),
				});
			}
		},
		[columns, updateColumnTags, updateDeviceLayout],
	);
}
