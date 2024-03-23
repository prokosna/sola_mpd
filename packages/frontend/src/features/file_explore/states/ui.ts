import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedFileExploreFolderAtom } from "./folders";

const isFileExploreLoadingAtom = atom(true);

const isFileExploreLoadingEffectAtom = atomEffect((get, set) => {
  get(selectedFileExploreFolderAtom);
  set(isFileExploreLoadingAtom, true);
});

export function useIsFileExploreLoadingState() {
  useAtom(isFileExploreLoadingEffectAtom);
  return useAtomValue(isFileExploreLoadingAtom);
}

export function useSetIsFileExploreLoadingState() {
  return useSetAtom(isFileExploreLoadingAtom);
}
