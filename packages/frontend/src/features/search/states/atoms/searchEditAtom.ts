import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { EditingSearchStatus } from "../../types/searchTypes";
import { savedSearchesAtom } from "./savedSearchesAtom";

export const editingSearchStatusAtom = atom(EditingSearchStatus.NOT_SAVED);

export const searchSongTableColumnsAtom = atom<SongTableColumn[]>([]);

/** The name in the query editor, which the editor keeps up to date. */
export const editingSearchNameAtom = atom("");

/**
 * Which saved search the editor currently holds, if any. Derived from the name
 * being edited, so it follows renaming into and out of a saved search, and
 * saving or deleting one, without anything having to keep it in step.
 */
export const selectedSavedSearchNameAtom = atom((get) => {
	const savedSearches = get(savedSearchesAtom);
	const editingSearchName = get(editingSearchNameAtom);
	return savedSearches?.searches.some(
		(search) => search.name === editingSearchName,
	)
		? editingSearchName
		: undefined;
});
