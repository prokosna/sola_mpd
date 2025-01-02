import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Atom for search loading state.
 *
 * Default: true (initially loading)
 */
const isSearchLoadingAtom = atom(true);

/**
 * Hook for search loading state.
 *
 * Provides read-only access to loading status.
 *
 * @returns Current loading state
 */
export function useIsSearchLoadingState() {
	return useAtomValue(isSearchLoadingAtom);
}

/**
 * Hook for updating loading state.
 *
 * Controls search loading indicator.
 *
 * @returns Update function
 */
export function useSetIsSearchLoadingState() {
	return useSetAtom(isSearchLoadingAtom);
}
