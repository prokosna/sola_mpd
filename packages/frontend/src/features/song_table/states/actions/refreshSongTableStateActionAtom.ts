import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { songTableStateAsyncAtom } from "../atoms/songTableAtom";

export const refreshSongTableStateActionAtom = atom(null, (_get, set) => {
	set(songTableStateAsyncAtom, RESET);
});
