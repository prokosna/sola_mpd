import { atom } from "jotai";

import {
	composeSearchSongTableColumnView,
	type SongTableColumnView,
	songTableColumnViewAtom,
	songTableDeviceLayoutAtom,
} from "../../../song_table";
import { searchSongTableColumnsAtom } from "./searchEditAtom";

/**
 * What the Search table currently shows: the saved search's own tag/sort
 * where set, else the shared library column set — width always from the
 * device. Shared by every reader so they all agree on "current".
 */
export const searchColumnViewAtom = atom<SongTableColumnView[] | undefined>(
	(get) => {
		const searchSongTableColumns = get(searchSongTableColumnsAtom);
		const deviceLayout = get(songTableDeviceLayoutAtom);
		if (deviceLayout === undefined) {
			return undefined;
		}
		if (searchSongTableColumns.length !== 0) {
			return composeSearchSongTableColumnView(
				searchSongTableColumns,
				deviceLayout,
			);
		}
		return get(songTableColumnViewAtom);
	},
);
