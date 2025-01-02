import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { recentlyAddedFiltersSyncAtom } from "./recentlyAddedFiltersState";

/**
 * Loading state.
 */
const isRecentlyAddedLoadingAtom = atom(true);

/**
 * Loading state effect.
 */
const setRecentlyAddedLoadingTrueEffectAtom = atomEffect((get, set) => {
	// Set isRecentlyAddedLoadingAtom to true when recentlyAddedFiltersAtom is updated.
	get(recentlyAddedFiltersSyncAtom);
	set(isRecentlyAddedLoadingAtom, true);
});

/**
 * Get loading state.
 *
 * @returns Loading state
 */
export function useIsRecentlyAddedLoadingState() {
	useAtom(setRecentlyAddedLoadingTrueEffectAtom);
	return useAtomValue(isRecentlyAddedLoadingAtom);
}

/**
 * Set loading state.
 *
 * @returns Loading state setter
 */
export function useSetIsRecentlyAddedLoadingState() {
	return useSetAtom(isRecentlyAddedLoadingAtom);
}
