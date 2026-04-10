import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { recentlyAddedBrowserFiltersAtom } from "./recentlyAddedFiltersAtom";

export const isRecentlyAddedLoadingAtom = atom(true);

export const syncRecentlyAddedLoadingEffectAtom = atomEffect((get, set) => {
	get(recentlyAddedBrowserFiltersAtom);
	set(isRecentlyAddedLoadingAtom, true);
});
