import { atom } from "jotai";

import { currentSongAsyncAtom } from "../atoms/currentSongAtom";

export const refreshCurrentSongActionAtom = atom(null, (_get, set) => {
	set(currentSongAsyncAtom);
});
