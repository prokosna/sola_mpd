import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedPlaylistAtom } from "./playlist";

const isPlaylistLoadingAtom = atom(true);

const isPlaylistLoadingEffectAtom = atomEffect((get, set) => {
  get(selectedPlaylistAtom);
  set(isPlaylistLoadingAtom, true);
});

export function useIsPlaylistLoadingState() {
  useAtom(isPlaylistLoadingEffectAtom);
  return useAtomValue(isPlaylistLoadingAtom);
}

export function useSetIsPlaylistLoadingState() {
  return useSetAtom(isPlaylistLoadingAtom);
}
