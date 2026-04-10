import { atom } from "jotai";

import { isTextToMusicSearchLoadingAtom } from "../atoms/textToMusicSearchUiAtom";

export const setIsTextToMusicSearchLoadingActionAtom = atom(
	null,
	(_get, set, isLoading: boolean) => {
		set(isTextToMusicSearchLoadingAtom, isLoading);
	},
);
