import { atom } from "jotai";

import { isAllSongsLoadingAtom } from "../atoms/allSongsUiAtom";

export const setIsAllSongsLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isAllSongsLoadingAtom, isLoading);
	},
);
