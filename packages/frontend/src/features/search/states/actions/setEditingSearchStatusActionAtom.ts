import { atom } from "jotai";

import type { EditingSearchStatus } from "../../types/searchTypes";
import { editingSearchStatusAtom } from "../atoms/searchEditAtom";

export const setEditingSearchStatusActionAtom = atom(
	null,
	(_get, set, status: EditingSearchStatus) => {
		set(editingSearchStatusAtom, status);
	},
);
