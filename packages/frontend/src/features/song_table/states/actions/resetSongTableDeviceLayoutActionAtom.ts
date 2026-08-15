import { atom } from "jotai";

import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

/**
 * Device-only reset: restores width and sort to the application defaults.
 * Writes an empty layout rather than deleting the key — deleting it would
 * re-arm the one-time device migration and re-import the workspace
 * document's deprecated widths/sort on the next load, undoing this reset.
 */
export const resetSongTableDeviceLayoutActionAtom = atom(null, (get, set) => {
	const current = get(songTableDeviceLayoutAtom);
	if (current === undefined) {
		return;
	}
	set(songTableDeviceLayoutAtom, { widthFlexByTag: {}, sort: [] });
});
