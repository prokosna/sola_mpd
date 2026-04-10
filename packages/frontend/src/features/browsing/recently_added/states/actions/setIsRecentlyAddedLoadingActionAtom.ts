import { atom } from "jotai";

import { isRecentlyAddedLoadingAtom } from "../atoms/recentlyAddedUiAtom";

export const setIsRecentlyAddedLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isRecentlyAddedLoadingAtom, isLoading);
	},
);
