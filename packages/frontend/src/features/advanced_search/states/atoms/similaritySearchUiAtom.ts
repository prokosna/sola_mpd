import { atom } from "jotai";

import { similaritySearchSongsAtom } from "./similaritySearchAtom";

export const isSimilaritySearchLoadingAtom = atom((get) => {
	const similaritySearchSongs = get(similaritySearchSongsAtom);
	return similaritySearchSongs?.length === 0;
});

export const isSimilaritySearchModalOpenAtom = atom<boolean>(false);
