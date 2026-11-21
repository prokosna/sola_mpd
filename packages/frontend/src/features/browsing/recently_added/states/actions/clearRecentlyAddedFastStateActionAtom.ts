import { atom } from "jotai";

import { storedRecentlyAddedFastStateAtom } from "../atoms/recentlyAddedFastStateAtom";

export const clearRecentlyAddedFastStateActionAtom = atom(
	null,
	(get, set, profileName: string) => {
		if (get(storedRecentlyAddedFastStateAtom)?.profileName === profileName) {
			set(storedRecentlyAddedFastStateAtom, undefined);
		}
	},
);
