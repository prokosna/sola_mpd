import { atom } from "jotai";

import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";

/** The atom's setter persists to device settings. */
export const updateSongTableColumnLayoutActionAtom = atom(
	null,
	(_get, set, layout: SongTableColumnLayout) => {
		set(songTableColumnLayoutAtom, layout);
	},
);
