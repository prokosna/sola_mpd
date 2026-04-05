import { atom } from "jotai";

import { isSimilaritySearchModalOpenAtom } from "../atoms/similaritySearchUiAtom";

export const setIsSimilaritySearchModalOpenActionAtom = atom(
	null,
	(_get, set, open: boolean) => {
		set(isSimilaritySearchModalOpenAtom, open);
	},
);
