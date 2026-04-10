import { atom } from "jotai";

import { isFileExploreLoadingAtom } from "../atoms/fileExploreUiAtom";

export const setIsFileExploreLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isFileExploreLoadingAtom, isLoading);
	},
);
