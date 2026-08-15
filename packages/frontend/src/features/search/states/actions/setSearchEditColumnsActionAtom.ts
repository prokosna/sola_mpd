import { atom } from "jotai";

import {
	type SearchEditColumns,
	searchEditColumnsAtom,
} from "../atoms/searchEditAtom";

/** Loads a saved search's own columns into the editor, replacing any edit in progress. */
export const setSearchEditColumnsActionAtom = atom(
	null,
	(_get, set, columns: SearchEditColumns | undefined) => {
		set(searchEditColumnsAtom, columns);
	},
);
