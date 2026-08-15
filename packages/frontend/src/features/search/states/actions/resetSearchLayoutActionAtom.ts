import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { resetPaneLayout } from "../../../../lib/resizablePanels/resetPaneLayout";
import {
	resetSongTableLayoutActionAtom,
	resetSongTableSearchWidthActionAtom,
	songTableDeviceLayoutAtom,
} from "../../../song_table";
import {
	SEARCH_NAVIGATION_PANEL_GROUP_ID,
	SEARCH_PANEL_GROUP_ID,
} from "../../const/searchPanelGroups";
import { selectedSavedSearchNameAtom } from "../atoms/searchEditAtom";
import { resetSearchSortActionAtom } from "./resetSearchSortActionAtom";

/**
 * Only a saved search is individual — an unsaved search's widths already
 * live in the shared map (nothing here to drop), so it resets like any
 * library view instead of claiming a search-scoped reset that would touch
 * nothing. A no-op while the device layout is still pending migration.
 */
export const resetSearchLayoutActionAtom = atom(null, (get, set) => {
	if (get(songTableDeviceLayoutAtom) === undefined) {
		return;
	}
	const searchName = get(selectedSavedSearchNameAtom);
	if (searchName === undefined) {
		set(resetSongTableLayoutActionAtom);
		return;
	}
	set(resetSongTableSearchWidthActionAtom, searchName);
	set(resetSearchSortActionAtom);
	resetPaneLayout(globalThis.localStorage, [
		SEARCH_PANEL_GROUP_ID,
		SEARCH_NAVIGATION_PANEL_GROUP_ID,
	]);
	showNotification({
		status: "success",
		title: "Layout reset",
		description:
			"Column widths and sort for this saved search, and this view's " +
			"pane sizes, have been reset to the application defaults.",
	});
});
