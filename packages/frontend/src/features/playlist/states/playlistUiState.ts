import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedPlaylistAtom } from "./playlistState";

const isPlaylistLoadingAtom = atom(true);

const setPlaylistLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(selectedPlaylistAtom);
  set(isPlaylistLoadingAtom, true);
});

/**
 * Hook for playlist loading state.
 *
 * Auto-sets loading to true on playlist change.
 *
 * @returns Current loading state
 */
export function useIsPlaylistLoadingState() {
  useAtom(setPlaylistLoadingTrueEffectAtom);
  return useAtomValue(isPlaylistLoadingAtom);
}

/**
 * Hook for updating loading state.
 *
 * @returns Loading state setter
 */
export function useSetIsPlaylistLoadingState() {
  return useSetAtom(isPlaylistLoadingAtom);
}
