import { atom } from "jotai";

import { browserSongsAsyncAtom } from "../atoms/browserSongsAtom";

export const refreshBrowserSongsActionAtom = atom(null, (_get, set) => {
	set(browserSongsAsyncAtom);
});
