import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { resetPaneLayout } from "../../../../lib/resizablePanels/resetPaneLayout";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

/**
 * Writes an empty layout rather than deleting the device key — deleting it
 * would re-arm the one-time device migration and re-import the workspace
 * document's deprecated widths/sort on the next load, undoing this reset.
 * A silent no-op while the migration is still pending.
 */
export const resetSongTableLayoutActionAtom = atom(null, (get, set) => {
	const current = get(songTableDeviceLayoutAtom);
	if (current === undefined) {
		return;
	}
	// Preserves per-search widths: this reset is scoped to the shared map only.
	set(songTableDeviceLayoutAtom, { ...current, widthFlexByTag: {}, sort: [] });
	resetPaneLayout();
	showNotification({
		status: "success",
		title: "Layout reset",
		description:
			"Column widths, sort, and pane sizes on this device have been reset " +
			"to the application defaults. Reopen the affected view to see the " +
			"default pane sizes.",
	});
});
