import { atom, useAtomValue, useSetAtom } from "jotai";

const isSearchLoadingAtom = atom(true);

export function useIsSearchLoadingState() {
  return useAtomValue(isSearchLoadingAtom);
}

export function useSetIsSearchLoadingState() {
  return useSetAtom(isSearchLoadingAtom);
}
