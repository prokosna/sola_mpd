import { atom } from "jotai";

import { advancedSearchQueryLimitAtom } from "../atoms/advancedSearchAtom";

export const setAdvancedSearchQueryLimitActionAtom = atom(
	null,
	(_get, set, limit: number) => {
		set(advancedSearchQueryLimitAtom, limit);
	},
);
