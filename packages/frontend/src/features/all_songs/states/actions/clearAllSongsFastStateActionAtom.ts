import { atom } from "jotai";

import { storedAllSongsFastStateAtom } from "../atoms/allSongsFastStateAtom";

export const clearAllSongsFastStateActionAtom = atom(
	null,
	(get, set, profileName: string) => {
		if (get(storedAllSongsFastStateAtom)?.profileName === profileName) {
			set(storedAllSongsFastStateAtom, undefined);
		}
	},
);
