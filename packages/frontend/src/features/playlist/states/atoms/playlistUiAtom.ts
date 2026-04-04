import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { selectedPlaylistAtom } from "./playlistAtom";

export const isPlaylistLoadingAtom = atom(true);

export const syncPlaylistLoadingEffectAtom = atomEffect((get, set) => {
	get(selectedPlaylistAtom);
	set(isPlaylistLoadingAtom, true);
});
