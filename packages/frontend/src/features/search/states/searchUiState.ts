import { atom, useAtomValue, useSetAtom } from "jotai";

const isSearchLoadingAtom = atom(true);

/**
 * Hook to get the current loading state of the search.
 * @returns The current loading state of the search.
 */
export function useIsSearchLoadingState() {
  return useAtomValue(isSearchLoadingAtom);
}

/**
 * Hook to get a function that sets the loading state of the search.
 *
 * @returns A function to set the loading state.
 */
export function useSetIsSearchLoadingState() {
  return useSetAtom(isSearchLoadingAtom);
}
