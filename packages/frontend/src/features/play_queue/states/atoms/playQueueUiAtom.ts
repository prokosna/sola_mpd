import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";

export const isPlayQueueLoadingAtom = atom(true);

export const syncPlayQueueLoadingEffectAtom = atomEffect((get, set) => {
	get(mpdClientAtom);
	get(currentMpdProfileAtom);
	set(isPlayQueueLoadingAtom, true);
});
