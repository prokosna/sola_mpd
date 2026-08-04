import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { selectedSongsAtom } from "../atoms/selectedSongsAtom";

/** The user changed which rows are selected in the visible song table. */
export const setSelectedSongsActionAtom = atom(
	null,
	(_get, set, songs: Song[]) => {
		set(selectedSongsAtom, songs);
	},
);
