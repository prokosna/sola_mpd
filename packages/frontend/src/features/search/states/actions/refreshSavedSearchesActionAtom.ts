import { atom } from "jotai";
import { RESET } from "jotai/utils";

import { savedSearchesAsyncAtom } from "../atoms/savedSearchesAtom";

export const refreshSavedSearchesActionAtom = atom(null, (_get, set) => {
	set(savedSearchesAsyncAtom, RESET);
});
