import { atom } from "jotai";

import { mpdCapabilitiesAtom } from "../../../mpd/states/atoms/mpdCapabilitiesAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { allSongsAsyncAtom } from "../atoms/allSongsAtom";
import { initialAllSongsFastState } from "../atoms/allSongsFastStateAtom";
import { loadAllSongsFastActionAtom } from "./loadAllSongsFastActionAtom";
import { setAllSongsFastStateActionAtom } from "./setAllSongsFastStateActionAtom";

export const refreshAllSongsActionAtom = atom(null, (get, set) => {
	const capabilities = get(mpdCapabilitiesAtom);
	if (capabilities.isMpd024OrLater) {
		const profile = get(currentMpdProfileAtom);
		if (profile === undefined) {
			return;
		}
		// Reset the accumulator and re-drive the chunk loop so the next read sees
		// a fresh library snapshot.
		set(setAllSongsFastStateActionAtom, profile.name, initialAllSongsFastState);
		set(loadAllSongsFastActionAtom);
		return;
	}
	set(allSongsAsyncAtom);
});
