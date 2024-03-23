import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { browserFiltersAtom } from "./filters";

const isBrowserLoadingAtom = atom(true);

const isBrowserLoadingEffectAtom = atomEffect((get, set) => {
  get(browserFiltersAtom);
  set(isBrowserLoadingAtom, true);
});

export function useIsBrowserLoadingState() {
  useAtom(isBrowserLoadingEffectAtom);
  return useAtomValue(isBrowserLoadingAtom);
}

export function useSetIsBrowserLoadingState() {
  return useSetAtom(isBrowserLoadingAtom);
}
