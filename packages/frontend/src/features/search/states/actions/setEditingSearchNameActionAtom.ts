import { atom } from "jotai";

import { editingSearchNameAtom } from "../atoms/searchEditAtom";

export const setEditingSearchNameActionAtom = atom(
	null,
	(_get, set, name: string) => {
		set(editingSearchNameAtom, name);
	},
);
