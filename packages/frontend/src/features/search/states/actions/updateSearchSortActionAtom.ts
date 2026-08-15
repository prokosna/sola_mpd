import { atom } from "jotai";

import type { SongTableDeviceLayoutSort } from "../../../song_table";
import { EditingSearchStatus } from "../../types/searchTypes";
import { searchColumnViewAtom } from "../atoms/searchColumnViewAtom";
import {
	editingSearchStatusAtom,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

/**
 * Sorting in Search: stages the new sort into the editor,
 * leaving the column set as it stood. The first edit of an as-yet-untouched
 * search materializes the tags it was showing (the shared library view)
 * rather than discarding them.
 */
export const updateSearchSortActionAtom = atom(
	null,
	(get, set, sort: SongTableDeviceLayoutSort[]) => {
		const current = get(searchEditColumnsAtom);
		const columnTags =
			current?.columnTags ??
			(get(searchColumnViewAtom) ?? []).map((column) => column.tag);
		set(searchEditColumnsAtom, { columnTags, sort });
		set(editingSearchStatusAtom, EditingSearchStatus.COLUMNS_UPDATED);
	},
);
