import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { recentlyAddedFiltersAtom } from "./recentlyAddedFiltersAtom";

export const isRecentlyAddedLoadingAtom = atom(true);

export const syncRecentlyAddedLoadingEffectAtom = atomEffect((get, set) => {
	get(recentlyAddedFiltersAtom);
	set(isRecentlyAddedLoadingAtom, true);
});
