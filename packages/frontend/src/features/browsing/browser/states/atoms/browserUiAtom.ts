import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { browserFiltersAtom } from "./browserFiltersAtom";

export const isBrowserLoadingAtom = atom(true);

export const setBrowserLoadingTrueEffectAtom = atomEffect((get, set) => {
	// Set isBrowserLoadingAtom to true when browserFiltersAtom is updated.
	get(browserFiltersAtom);
	set(isBrowserLoadingAtom, true);
});
