import { atom } from "jotai";

import { selectedSongsAtom } from "../atoms/selectedSongsAtom";

/**
 * Drops the selection. Separate from setSelectedSongsActionAtom because the
 * caller is not a song table reporting its rows: navigating to another page
 * invalidates whatever was selected on the previous one.
 */
export const clearSelectedSongsActionAtom = atom(null, (_get, set) => {
	set(selectedSongsAtom, []);
});
