import { atom } from "jotai";

import { EditingSearchStatus } from "../../types/searchTypes";
import {
	editingSearchStatusAtom,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

/**
 * No-op without a staged override: an untouched search shows the shared
 * library columns, whose sort lives in the device layout and resets there.
 * Creating an override here would give the search its own columns as a
 * side effect of a reset.
 */
export const resetSearchSortActionAtom = atom(null, (get, set) => {
	const current = get(searchEditColumnsAtom);
	if (current === undefined) {
		return;
	}
	set(searchEditColumnsAtom, { ...current, sort: [] });
	set(editingSearchStatusAtom, EditingSearchStatus.COLUMNS_UPDATED);
});
