import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedPlaylistAtom } from "./playlistState";

const isPlaylistLoadingAtom = atom(true);

const setPlaylistLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(selectedPlaylistAtom);
  set(isPlaylistLoadingAtom, true);
});

/**
 * Hook to get the current loading state of the playlist.
 *
 * This hook triggers a side effect to set the loading state to true
 * when the selected playlist changes, and returns the current loading state.
 *
 * @returns The current loading state of the playlist.
 */
export function useIsPlaylistLoadingState() {
  useAtom(setPlaylistLoadingTrueEffectAtom);
  return useAtomValue(isPlaylistLoadingAtom);
}

/**
 * Hook to get a function that sets the loading state of the playlist.
 *
 * @returns A function to set the loading state.
 */
export function useSetIsPlaylistLoadingState() {
  return useSetAtom(isPlaylistLoadingAtom);
}
