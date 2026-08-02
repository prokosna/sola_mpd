import { atom } from "jotai";

import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";

// Device-only reset for the "This device" settings tab
// (docs/design/state-scoping.md §11): clears this browser's column widths
// and sort order without touching the server-side column set/order, and
// without touching any other device setting.
export const resetSongTableColumnLayoutActionAtom = atom(null, (_get, set) => {
	set(songTableColumnLayoutAtom, {});
});
