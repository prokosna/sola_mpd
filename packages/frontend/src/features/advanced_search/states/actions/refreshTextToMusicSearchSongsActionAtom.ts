import { atom } from "jotai";

import { textToMusicSearchSongsAsyncAtom } from "../atoms/textToMusicSearchAtom";

export const refreshTextToMusicSearchSongsActionAtom = atom(
	null,
	(_get, set) => {
		set(textToMusicSearchSongsAsyncAtom);
	},
);
