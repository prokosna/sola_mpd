import { atom } from "jotai";

import { allSongsAsyncAtom } from "../atoms/allSongsAtom";

export const refreshAllSongsActionAtom = atom(null, (_get, set) => {
	set(allSongsAsyncAtom);
});
