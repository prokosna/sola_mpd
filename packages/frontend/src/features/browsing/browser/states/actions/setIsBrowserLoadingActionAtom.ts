import { atom } from "jotai";

import { isBrowserLoadingAtom } from "../atoms/browserUiAtom";

export const setIsBrowserLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isBrowserLoadingAtom, isLoading);
	},
);
