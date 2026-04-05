import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";

export const isAllSongsLoadingAtom = atom(true);

export const syncAllSongsLoadingEffectAtom = atomEffect((get, set) => {
	get(mpdClientAtom);
	get(currentMpdProfileAtom);
	set(isAllSongsLoadingAtom, true);
});
