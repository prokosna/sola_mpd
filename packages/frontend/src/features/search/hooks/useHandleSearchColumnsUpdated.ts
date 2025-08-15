import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback } from "react";

import {
	useSearchSongTableColumnsState,
	useSetEditingSearchState,
	useSetSearchSongTableColumnsState,
} from "../states/searchEditState";
import { EditingSearchStatus } from "../types/searchTypes";

/**
 * Hook for handling search column updates.
 *
 * Updates editing search with new columns.
 *
 * @returns Column update handler
 */
export function useHandleSearchColumnsUpdated() {
	const searchSongTableColumns = useSearchSongTableColumnsState();
	const setSearchSongTableColumns = useSetSearchSongTableColumnsState();
	const setEditingSearchStatus = useSetEditingSearchState();

	return useCallback(
		(columns: SongTableColumn[]) => {
			setSearchSongTableColumns(columns);
			if (searchSongTableColumns.length !== 0) {
				setEditingSearchStatus(EditingSearchStatus.COLUMNS_UPDATED);
			}
		},
		[setSearchSongTableColumns, setEditingSearchStatus, searchSongTableColumns],
	);
}
