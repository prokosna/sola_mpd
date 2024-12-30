import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAY_QUEUE } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchPlayQueueSongs } from "../utils/playQueueSongsUtils";

const playQueueSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return [];
  }

  const songs = await fetchPlayQueueSongs(mpdClient, profile);

  return songs;
});

const playQueueSongsSyncAtom = atomWithSync(playQueueSongsAtom);

const playQueueVisibleSongsSyncAtom = atom((get) => {
  const playQueueSongs = get(playQueueSongsSyncAtom);
  const songTableState = get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (
    pathname !== ROUTE_HOME_PLAY_QUEUE ||
    playQueueSongs === undefined ||
    songTableState === undefined
  ) {
    return [];
  }

  const filteredSongs = filterSongsByGlobalFilter(
    playQueueSongs,
    globalFilterTokens,
    songTableState.columns,
  );

  return filteredSongs;
});

export function usePlayQueueSongsState() {
  return useAtomValue(playQueueVisibleSongsSyncAtom);
}

export function useRefreshPlayQueueSongsState() {
  return useSetAtom(playQueueSongsAtom);
}
