import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { similaritySearchTargetSongAtom } from "../atoms/similaritySearchAtom";

export const setSimilaritySearchTargetSongActionAtom = atom(
	null,
	(_get, set, song: Song | undefined) => {
		set(similaritySearchTargetSongAtom, song);
	},
);
