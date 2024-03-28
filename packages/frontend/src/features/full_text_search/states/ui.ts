import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";

const isFullTextSearchLoadingAtom = atom(true);

const isFullTextSearchLoadingEffectAtom = atomEffect((get, set) => {
  get(mpdClientAtom);
  get(currentMpdProfileAtom);
  set(isFullTextSearchLoadingAtom, true);
});

export function useIsFullTextSearchLoadingState() {
  useAtom(isFullTextSearchLoadingEffectAtom);
  return useAtomValue(isFullTextSearchLoadingAtom);
}
export function useSetIsFullTextSearchLoadingState() {
  return useSetAtom(isFullTextSearchLoadingAtom);
}
