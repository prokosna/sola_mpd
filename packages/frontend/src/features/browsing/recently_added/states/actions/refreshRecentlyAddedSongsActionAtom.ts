import { atom } from "jotai";

import { recentlyAddedSongsAsyncAtom } from "../atoms/recentlyAddedSongsAtom";

export const refreshRecentlyAddedSongsActionAtom = atom(null, (_get, set) => {
	set(recentlyAddedSongsAsyncAtom);
});
