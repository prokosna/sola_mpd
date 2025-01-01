import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { recentlyAddedFiltersSyncAtom } from "./recentlyAddedFiltersState";

const isRecentlyAddedLoadingAtom = atom(true);

const setRecentlyAddedLoadingTrueEffectAtom = atomEffect((get, set) => {
  // Set isRecentlyAddedLoadingAtom to true when recentlyAddedFiltersAtom is updated.
  get(recentlyAddedFiltersSyncAtom);
  set(isRecentlyAddedLoadingAtom, true);
});

/**
 * Returns the state of whether the recently added view is loading.
 * @returns The state of whether the recently added view is loading.
 */
export function useIsRecentlyAddedLoadingState() {
  useAtom(setRecentlyAddedLoadingTrueEffectAtom);
  return useAtomValue(isRecentlyAddedLoadingAtom);
}

/**
 * Returns a function to set the recently added loading state.
 * @returns A function that takes a boolean parameter to update the loading state.
 */
export function useSetIsRecentlyAddedLoadingState() {
  return useSetAtom(isRecentlyAddedLoadingAtom);
}
