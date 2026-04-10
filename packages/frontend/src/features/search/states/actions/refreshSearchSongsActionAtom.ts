import { atom } from "jotai";

import { searchSongsAsyncAtom } from "../atoms/searchSongsAtom";

export const refreshSearchSongsActionAtom = atom(null, (_get, set) => {
	set(searchSongsAsyncAtom);
});
