import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { browserFiltersAtom } from "./browserFiltersAtom";

export const isBrowserLoadingAtom = atom(true);

export const syncBrowserLoadingEffectAtom = atomEffect((get, set) => {
	get(browserFiltersAtom);
	set(isBrowserLoadingAtom, true);
});
