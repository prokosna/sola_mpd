import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";

export const isPlayQueueLoadingAtom = atom(true);

export const syncPlayQueueLoadingEffectAtom = atomEffect((get, set) => {
	get(mpdClientAtom);
	get(currentMpdProfileAtom);
	set(isPlayQueueLoadingAtom, true);
});
