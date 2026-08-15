import { atom } from "jotai";

import {
	composeSongTableColumnView,
	type SongTableColumnView,
	songTableColumnViewAtom,
	songTableDeviceLayoutAtom,
} from "../../../song_table";
import {
	searchEditColumnsAtom,
	selectedSavedSearchNameAtom,
} from "./searchEditAtom";

// Falling back to the shared width before the default is what keeps a saved
// search nobody has resized inside looking like the rest of the app.
export const searchColumnViewAtom = atom<SongTableColumnView[] | undefined>(
	(get) => {
		const searchEditColumns = get(searchEditColumnsAtom);
		const deviceLayout = get(songTableDeviceLayoutAtom);
		if (deviceLayout === undefined) {
			return undefined;
		}
		if (
			searchEditColumns !== undefined &&
			searchEditColumns.columnTags.length !== 0
		) {
			const searchName = get(selectedSavedSearchNameAtom);
			const searchWidthFlexByTag =
				searchName !== undefined
					? deviceLayout.widthFlexByTagBySearchName?.[searchName]
					: undefined;
			return composeSongTableColumnView(
				searchEditColumns.columnTags,
				deviceLayout.widthFlexByTag,
				searchEditColumns.sort,
				searchWidthFlexByTag,
			);
		}
		return get(songTableColumnViewAtom);
	},
);
