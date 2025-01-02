import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { browserFiltersSyncAtom } from "./browserFiltersState";

/**
 * Atom for tracking browser loading state.
 * Defaults to true for initial loading.
 */
const isBrowserLoadingAtom = atom(true);

/**
 * Effect atom that automatically sets loading state to true
 * when browser filters are updated.
 */
const setBrowserLoadingTrueEffectAtom = atomEffect((get, set) => {
	// Set isBrowserLoadingAtom to true when browserFiltersAtom is updated.
	get(browserFiltersSyncAtom);
	set(isBrowserLoadingAtom, true);
});

/**
 * Hook to access the browser loading state.
 *
 * Features:
 * - Automatic loading state management
 * - Filter update detection
 *
 * @returns Current loading state
 */
export function useIsBrowserLoadingState() {
	useAtom(setBrowserLoadingTrueEffectAtom);
	return useAtomValue(isBrowserLoadingAtom);
}

/**
 * Hook to manually control browser loading state.
 *
 * Features:
 * - Direct loading state control
 * - Type-safe state updates
 *
 * @returns Function to update loading state
 */
export function useSetIsBrowserLoadingState() {
	return useSetAtom(isBrowserLoadingAtom);
}
