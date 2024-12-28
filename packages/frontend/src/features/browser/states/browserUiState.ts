import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { browserFiltersSyncAtom } from "./browserFiltersState";

const isBrowserLoadingAtom = atom(true);

const setBrowserLoadingTrueEffectAtom = atomEffect((get, set) => {
  // Set isBrowserLoadingAtom to true when browserFiltersAtom is updated.
  get(browserFiltersSyncAtom);
  set(isBrowserLoadingAtom, true);
});

/**
 * Returns the state of whether the browser is loading.
 * @returns The state of whether the browser is loading.
 */
export function useIsBrowserLoadingState() {
  useAtom(setBrowserLoadingTrueEffectAtom);
  return useAtomValue(isBrowserLoadingAtom);
}

/**
 * Returns a function to set the browser loading state.
 * @returns A function that takes a boolean parameter to update the loading state.
 */
export function useSetIsBrowserLoadingState() {
  return useSetAtom(isBrowserLoadingAtom);
}
