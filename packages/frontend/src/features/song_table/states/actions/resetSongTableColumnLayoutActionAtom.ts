import { atom } from "jotai";

import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

// Device-only reset for the "Device Settings" tab (R2): clears this
// browser's column widths without touching sort, the server-side column
// set, or any other device setting. A no-op while the migration is pending,
// since the underlying atom refuses writes until it resolves.
export const resetSongTableColumnLayoutActionAtom = atom(null, (get, set) => {
	const current = get(songTableDeviceLayoutAtom);
	if (current === undefined) {
		return;
	}
	set(songTableDeviceLayoutAtom, { widthFlexByTag: {}, sort: current.sort });
});
