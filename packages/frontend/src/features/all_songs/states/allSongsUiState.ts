import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";

/**
 * Atom for tracking the loading state of all songs.
 * Defaults to true to show loading on initial fetch.
 */
const isAllSongsLoadingAtom = atom(true);

/**
 * Effect atom that sets loading to true when MPD client
 * or profile changes, triggering a new data fetch.
 */
const setAllSongsLoadingTrueEffectAtom = atomEffect((get, set) => {
  get(mpdClientAtom);
  get(currentMpdProfileSyncAtom);
  set(isAllSongsLoadingAtom, true);
});

/**
 * Hook to access the all songs loading state.
 * Automatically sets loading to true on client/profile changes.
 *
 * @returns Current loading state
 */
export function useIsAllSongsLoadingState(): boolean {
  useAtom(setAllSongsLoadingTrueEffectAtom);
  return useAtomValue(isAllSongsLoadingAtom);
}

/**
 * Hook to update the all songs loading state.
 *
 * @returns Setter function for loading state
 */
export function useSetIsAllSongsLoadingState() {
  return useSetAtom(isAllSongsLoadingAtom);
}
