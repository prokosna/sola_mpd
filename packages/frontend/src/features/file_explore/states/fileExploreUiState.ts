import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedFileExploreFolderAtom } from "./fileExploreFoldersState";

const isFileExploreLoadingAtom = atom(true);

const setFileExploreLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(selectedFileExploreFolderAtom);
  set(isFileExploreLoadingAtom, true);
});

/**
 * Hook to get the current loading state of the file explorer.
 *
 * This hook triggers a side effect to set the loading state to true
 * when the selected folder changes, and returns the current loading state.
 *
 * @returns {boolean} The current loading state of the file explorer.
 */
export function useIsFileExploreLoadingState(): boolean {
  useAtom(setFileExploreLoadingTrueEffectAtom);
  return useAtomValue(isFileExploreLoadingAtom);
}

/**
 * Hook to get a function that sets the loading state of the file explorer.
 *
 * @returns {(isLoading: boolean) => void} A function to set the loading state.
 */
export function useSetIsFileExploreLoadingState() {
  return useSetAtom(isFileExploreLoadingAtom);
}
