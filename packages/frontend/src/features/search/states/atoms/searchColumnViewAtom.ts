import { atom } from "jotai";

import {
	composeSongTableColumnView,
	type SongTableColumnView,
	songTableColumnViewAtom,
	songTableDeviceLayoutAtom,
} from "../../../song_table";
import { searchEditColumnsAtom } from "./searchEditAtom";

/**
 * What the Search table currently shows: the saved search's own tag/sort
 * where set, else the shared library column set — width always from the
 * device. Shared by every reader so they all agree on "current".
 */
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
			return composeSongTableColumnView(
				searchEditColumns.columnTags,
				deviceLayout.widthFlexByTag,
				searchEditColumns.sort,
			);
		}
		return get(songTableColumnViewAtom);
	},
);
