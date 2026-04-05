import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { recentlyAddedBrowserFiltersAtom } from "./recentlyAddedFiltersAtom";

export const isRecentlyAddedLoadingAtom = atom(true);

export const setRecentlyAddedLoadingTrueEffectAtom = atomEffect((get, set) => {
	// Set isRecentlyAddedLoadingAtom to true when recentlyAddedBrowserFiltersAtom is updated.
	get(recentlyAddedBrowserFiltersAtom);
	set(isRecentlyAddedLoadingAtom, true);
});
