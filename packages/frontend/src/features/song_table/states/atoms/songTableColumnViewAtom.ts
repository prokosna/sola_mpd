import { atom } from "jotai";

import { composeSongTableColumnView } from "../../functions/songTableColumnView";
import type { SongTableColumnView } from "../../types/songTableTypes";
import { songTableServerStateAtom } from "./songTableAtom";
import { songTableDeviceLayoutAtom } from "./songTableDeviceLayoutAtom";

// `undefined` until both sources resolve, never an empty array: a table that
// paints defaults meanwhile persists them on the first column drag.
export const songTableColumnViewAtom = atom<SongTableColumnView[] | undefined>(
	(get) => {
		const serverState = get(songTableServerStateAtom);
		const deviceLayout = get(songTableDeviceLayoutAtom);
		if (serverState === undefined || deviceLayout === undefined) {
			return undefined;
		}
		return composeSongTableColumnView(
			serverState.columnTags,
			deviceLayout.widthFlexByTag,
			deviceLayout.sort,
		);
	},
);
