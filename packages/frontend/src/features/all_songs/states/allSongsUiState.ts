import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";

const isAllSongsLoadingAtom = atom(true);

const setAllSongsLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(mpdClientAtom);
  get(currentMpdProfileSyncAtom);
  set(isAllSongsLoadingAtom, true);
});

/**
 * Hook to get the current loading state of all songs.
 *
 * This hook triggers a side effect to set the loading state to true
 * when the MPD client or current profile changes, and returns the current loading state.
 *
 * @returns {boolean} The current loading state of all songs.
 */
export function useIsAllSongsLoadingState(): boolean {
  useAtom(setAllSongsLoadingTrueEffectAtom);
  return useAtomValue(isAllSongsLoadingAtom);
}

/**
 * Hook to get a function that sets the loading state for all songs.
 *
 * @returns {(isLoading: boolean) => void} A function to set the loading state.
 */
export function useSetIsAllSongsLoadingState() {
  return useSetAtom(isAllSongsLoadingAtom);
}
