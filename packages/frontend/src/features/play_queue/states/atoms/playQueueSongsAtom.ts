import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAY_QUEUE } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/atoms/globalFilterAtom";
import { pathnameAtom } from "../../../location/states/atoms/locationAtom";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { songTableColumnViewAtom } from "../../../song_table/states/atoms/songTableColumnViewAtom";
import { fetchPlayQueueSongs } from "../../functions/playQueueFetching";

export const playQueueSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchPlayQueueSongs(mpdClient, profile);
});

const playQueueSongsAtom = atomWithSync(playQueueSongsAsyncAtom);

export const playQueueVisibleSongsAtom = atom((get) => {
	const playQueueSongs = get(playQueueSongsAtom);
	const songTableColumns = get(songTableColumnViewAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_PLAY_QUEUE ||
		playQueueSongs === undefined ||
		songTableColumns === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		playQueueSongs,
		globalFilterTokens,
		songTableColumns,
	);
});
