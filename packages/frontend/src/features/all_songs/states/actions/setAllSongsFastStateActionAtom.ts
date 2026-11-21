import { atom } from "jotai";

import {
	type AllSongsFastState,
	storedAllSongsFastStateAtom,
} from "../atoms/allSongsFastStateAtom";

export const setAllSongsFastStateActionAtom = atom(
	null,
	(_get, set, profileName: string, state: AllSongsFastState) => {
		set(storedAllSongsFastStateAtom, { profileName, state });
	},
);
