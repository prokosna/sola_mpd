import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedFileExploreFolderAtom } from "./fileExploreFoldersState";

/**
 * Atom for tracking file explorer loading state.
 * Defaults to true for initial loading.
 */
const isFileExploreLoadingAtom = atom(true);

/**
 * Effect atom that automatically sets loading state to true
 * when selected folder changes.
 */
const setFileExploreLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(selectedFileExploreFolderAtom);
  set(isFileExploreLoadingAtom, true);
});

/**
 * Hook to access file explorer loading state.
 *
 * Features:
 * - Automatic loading state management
 * - Folder selection detection
 * - Loading state synchronization
 *
 * @returns Current loading state
 */
export function useIsFileExploreLoadingState(): boolean {
  useAtom(setFileExploreLoadingTrueEffectAtom);
  return useAtomValue(isFileExploreLoadingAtom);
}

/**
 * Hook to manually control file explorer loading state.
 *
 * Features:
 * - Direct loading state control
 * - Type-safe state updates
 * - Independent of automatic updates
 *
 * @returns Function to update loading state
 */
export function useSetIsFileExploreLoadingState() {
  return useSetAtom(isFileExploreLoadingAtom);
}
