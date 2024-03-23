import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";

const isPlayQueueLoadingAtom = atom(true);

const isPlayQueueLoadingEffectAtom = atomEffect((get, set) => {
  get(mpdClientAtom);
  get(currentMpdProfileAtom);
  set(isPlayQueueLoadingAtom, true);
});

export function useIsPlayQueueLoadingState() {
  useAtom(isPlayQueueLoadingEffectAtom);
  return useAtomValue(isPlayQueueLoadingAtom);
}
export function useSetIsPlayQueueLoadingState() {
  return useSetAtom(isPlayQueueLoadingAtom);
}
