import { atom } from "jotai";

import { playQueueSongsAsyncAtom } from "../atoms/playQueueSongsAtom";

export const refreshPlayQueueSongsActionAtom = atom(null, (_get, set) => {
	set(playQueueSongsAsyncAtom);
});
