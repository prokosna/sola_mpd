import type { AdvancedSearchCommand_SimilarityType } from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { atom } from "jotai";

import { similaritySearchTypeAtom } from "../atoms/similaritySearchAtom";

export const setSimilaritySearchTypeActionAtom = atom(
	null,
	(_get, set, type: AdvancedSearchCommand_SimilarityType) => {
		set(similaritySearchTypeAtom, type);
	},
);
