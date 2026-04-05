import { atom } from "jotai";

import { isSearchLoadingAtom } from "../atoms/searchUiAtom";

export const setIsSearchLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isSearchLoadingAtom, isLoading);
	},
);
