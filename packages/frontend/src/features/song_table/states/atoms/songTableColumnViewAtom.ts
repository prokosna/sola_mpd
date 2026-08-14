import { atom } from "jotai";

import { composeSongTableColumnView } from "../../functions/songTableColumnView";
import type { SongTableColumnView } from "../../types/songTableTypes";
import { songTableServerStateAtom } from "./songTableAtom";
import { songTableDeviceLayoutAtom } from "./songTableDeviceLayoutAtom";

/**
 * The shared column set every library view reads (DESIGN.md §6): tag order
 * from the workspace document, width and sort from the device layout.
 * `undefined` until both the server document and the device migration have
 * resolved — never an empty array standing in for "not ready yet".
 */
export const songTableColumnViewAtom = atom<SongTableColumnView[] | undefined>(
	(get) => {
		const serverState = get(songTableServerStateAtom);
		const deviceLayout = get(songTableDeviceLayoutAtom);
		if (serverState === undefined || deviceLayout === undefined) {
			return undefined;
		}
		return composeSongTableColumnView(serverState.columnTags, deviceLayout);
	},
);
