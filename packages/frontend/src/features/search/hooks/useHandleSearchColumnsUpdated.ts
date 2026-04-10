import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { setEditingSearchStatusActionAtom } from "../states/actions/setEditingSearchStatusActionAtom";
import { setSearchSongTableColumnsActionAtom } from "../states/actions/setSearchSongTableColumnsActionAtom";
import { searchSongTableColumnsAtom } from "../states/atoms/searchEditAtom";
import { EditingSearchStatus } from "../types/searchTypes";

export function useHandleSearchColumnsUpdated() {
	const searchSongTableColumns = useAtomValue(searchSongTableColumnsAtom);
	const setSearchSongTableColumns = useSetAtom(
		setSearchSongTableColumnsActionAtom,
	);
	const setEditingSearchStatus = useSetAtom(setEditingSearchStatusActionAtom);

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
