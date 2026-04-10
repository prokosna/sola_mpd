import { atom } from "jotai";

import { textToMusicSearchTextAtom } from "../atoms/textToMusicSearchAtom";

export const setTextToMusicSearchTextActionAtom = atom(
	null,
	(_get, set, text: string) => {
		set(textToMusicSearchTextAtom, text);
	},
);
