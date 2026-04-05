import { atom } from "jotai";

import { ROUTE_HOME_FILE_EXPLORE } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { songTableStateAtom } from "../../../song_table/states/atoms/songTableAtom";
import { fetchFileExploreSongs } from "../../utils/fileExploreSongsUtils";

import { selectedFileExploreFolderAtom } from "./fileExploreFoldersAtom";

const fileExploreSongsAsyncAtom = atom(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	const selectedFileExploreFolder = get(selectedFileExploreFolderAtom);

	if (profile === undefined) {
		return undefined;
	}
	if (selectedFileExploreFolder === undefined) {
		return [];
	}

	return await fetchFileExploreSongs(
		mpdClient,
		profile,
		selectedFileExploreFolder,
	);
});

const fileExploreSongsAtom = atomWithSync(fileExploreSongsAsyncAtom);

export const fileExploreVisibleSongsAtom = atom((get) => {
	const fileExploreSongs = get(fileExploreSongsAtom);
	const songTableState = get(songTableStateAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_FILE_EXPLORE ||
		songTableState === undefined ||
		fileExploreSongs === undefined
	) {
		return undefined;
	}

	const filteredSongs = filterSongsByGlobalFilter(
		fileExploreSongs,
		globalFilterTokens,
		songTableState.columns,
	);

	return filteredSongs.toSorted((a, b) => (a.path > b.path ? 1 : -1));
});
