import { atom } from "jotai";

import { similaritySearchSongsAsyncAtom } from "../atoms/similaritySearchAtom";

export const refreshSimilaritySearchSongsActionAtom = atom(
	null,
	(_get, set) => {
		set(similaritySearchSongsAsyncAtom);
	},
);
