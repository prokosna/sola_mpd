import { atom } from "jotai";

import type { SongTableColumnLayout } from "../../types/songTableTypes";
import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";

/**
 * Records this device's column widths and sort order. The atom's own setter
 * persists to device settings; going through an action keeps that write on the
 * same path as every other state change.
 */
export const updateSongTableColumnLayoutActionAtom = atom(
	null,
	(_get, set, layout: SongTableColumnLayout) => {
		set(songTableColumnLayoutAtom, layout);
	},
);
