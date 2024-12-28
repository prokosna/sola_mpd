import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";

const isPlayQueueLoadingAtom = atom(true);

const setPlayQueueLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(mpdClientAtom);
  get(currentMpdProfileSyncAtom);
  set(isPlayQueueLoadingAtom, true);
});

/**
 * Hook to get the current loading state of the play queue.
 *
 * This hook triggers a side effect to set the loading state to true
 * when the MPD client or current profile changes, and returns the current loading state.
 *
 * @returns The current loading state of the play queue.
 */
export function useIsPlayQueueLoadingState(): boolean {
  useAtom(setPlayQueueLoadingTrueEffectAtom);
  return useAtomValue(isPlayQueueLoadingAtom);
}

/**
 * Hook to get a function that sets the loading state for the play queue.
 *
 * @returns A function to set the loading state.
 */
export function useSetIsPlayQueueLoadingState() {
  return useSetAtom(isPlayQueueLoadingAtom);
}
