import { atom } from "jotai";

import { searchParamsAtom } from "../atoms/locationAtom";

export const setSearchParamsActionAtom = atom(
	null,
	(_get, set, search: string) => {
		set(searchParamsAtom, search);
	},
);
