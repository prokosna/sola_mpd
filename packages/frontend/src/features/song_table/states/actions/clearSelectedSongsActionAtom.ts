import { atom } from "jotai";

import { selectedSongsAtom } from "../atoms/selectedSongsAtom";

/** Navigating to another page invalidates whatever was selected on it. */
export const clearSelectedSongsActionAtom = atom(null, (_get, set) => {
	set(selectedSongsAtom, []);
});
