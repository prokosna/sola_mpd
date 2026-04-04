import { atom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAY_QUEUE } from "../../../../const/routes";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../../global_filter";
import { globalFilterTokensAtom } from "../../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../../location/states/locationState";
import { mpdClientAtom } from "../../../mpd/states/atoms/mpdClientAtom";
import { currentMpdProfileSyncAtom as currentMpdProfileAtom } from "../../../profile/states/mpdProfileState";
import { songTableStateSyncAtom as songTableStateAtom } from "../../../song_table/states/songTableState";
import { fetchPlayQueueSongs } from "../../utils/playQueueSongsUtils";

export const playQueueSongsAsyncAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);

	if (profile === undefined) {
		return undefined;
	}

	return await fetchPlayQueueSongs(mpdClient, profile);
});

const playQueueSongsSourceAtom = atomWithSync(playQueueSongsAsyncAtom);

export const playQueueSongsAtom = atom((get) => {
	const playQueueSongs = get(playQueueSongsSourceAtom);
	const songTableState = get(songTableStateAtom);
	const globalFilterTokens = get(globalFilterTokensAtom);
	const pathname = get(pathnameAtom);

	if (
		pathname !== ROUTE_HOME_PLAY_QUEUE ||
		playQueueSongs === undefined ||
		songTableState === undefined
	) {
		return undefined;
	}

	return filterSongsByGlobalFilter(
		playQueueSongs,
		globalFilterTokens,
		songTableState.columns,
	);
});
