import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { recentlyAddedStateAsyncAtom } from "../atoms/recentlyAddedStateAtom";

export const refreshRecentlyAddedStateActionAtom = atom(null, (_get, set) => {
	set(recentlyAddedStateAsyncAtom, RESET);
});
