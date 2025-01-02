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
 * Hook for accessing play queue loading state.
 *
 * Automatically sets loading to true when MPD client or profile
 * changes. Returns current loading state.
 *
 * @returns Current loading state
 */
export function useIsPlayQueueLoadingState(): boolean {
  useAtom(setPlayQueueLoadingTrueEffectAtom);
  return useAtomValue(isPlayQueueLoadingAtom);
}

/**
 * Hook for controlling play queue loading state.
 *
 * @returns Loading state setter function
 */
export function useSetIsPlayQueueLoadingState() {
  return useSetAtom(isPlayQueueLoadingAtom);
}
