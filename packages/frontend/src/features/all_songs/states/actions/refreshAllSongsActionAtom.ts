import { atom } from "jotai";

import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { allSongsAsyncAtom } from "../atoms/allSongsAtom";
import {
	allSongsFastStateAtom,
	initialAllSongsFastState,
} from "../atoms/allSongsFastStateAtom";
import { loadAllSongsFastActionAtom } from "./loadAllSongsFastActionAtom";

export const refreshAllSongsActionAtom = atom(null, (get, set) => {
	const capabilities = get(mpdCapabilitiesAtom);
	if (capabilities.isMpd024OrLater) {
		// Reset the accumulator and re-drive the chunk loop so the next read sees
		// a fresh library snapshot.
		set(allSongsFastStateAtom, initialAllSongsFastState);
		set(loadAllSongsFastActionAtom);
		return;
	}
	set(allSongsAsyncAtom);
});
