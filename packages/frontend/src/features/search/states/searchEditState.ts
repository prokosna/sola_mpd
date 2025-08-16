import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { EditingSearchStatus } from "../types/searchTypes";

/**
 * Atom for search edit status.
 *
 * Tracks modification state (NOT_SAVED, COLUMNS_UPDATED, SAVED).
 */
const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

/**
 * Atom for search song table columns.
 */
export const searchSongTableColumnsAtom = atom<SongTableColumn[]>([]);

/**
 * Hook for editing search status.
 *
 * Tracks if changes are saved.
 *
 * @returns Current edit status
 */
export function useEditingSearchStatusState() {
	return useAtomValue(editingSearchStatusAtom);
}

/**
 * Hook for updating editing search.
 *
 * Updates both search config and status.
 *
 * @returns Update function
 */
export function useSetEditingSearchState() {
	const setEditingSearchStatus = useSetAtom(editingSearchStatusAtom);

	return useCallback(
		(status: EditingSearchStatus) => {
			setEditingSearchStatus(status);
		},
		[setEditingSearchStatus],
	);
}

/**
 * Hook for current search song table columns.
 */
export function useSearchSongTableColumnsState() {
	return useAtomValue(searchSongTableColumnsAtom);
}

/**
 * Hook for updating search song table columns.
 *
 * @returns Update function
 */
export function useSetSearchSongTableColumnsState() {
	const setSearchSongTableColumns = useSetAtom(searchSongTableColumnsAtom);
	return useCallback(
		(columns: SongTableColumn[]) => {
			setSearchSongTableColumns(columns);
		},
		[setSearchSongTableColumns],
	);
}
