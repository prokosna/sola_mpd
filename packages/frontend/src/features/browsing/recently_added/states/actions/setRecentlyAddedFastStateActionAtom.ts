import { atom } from "jotai";

import {
	type RecentlyAddedFastState,
	storedRecentlyAddedFastStateAtom,
} from "../atoms/recentlyAddedFastStateAtom";

export const setRecentlyAddedFastStateActionAtom = atom(
	null,
	(_get, set, profileName: string, state: RecentlyAddedFastState) => {
		set(storedRecentlyAddedFastStateAtom, { profileName, state });
	},
);
