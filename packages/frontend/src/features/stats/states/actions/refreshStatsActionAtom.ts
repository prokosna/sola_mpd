import { atom } from "jotai";

import { statsAsyncAtom } from "../atoms/statsAtom";

export const refreshStatsActionAtom = atom(null, (_get, set) => {
	set(statsAsyncAtom);
});
