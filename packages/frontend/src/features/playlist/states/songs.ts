import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { ROUTE_HOME_PLAYLIST } from "../../../const/routes";
import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";
import { commonSongTableStateAtom } from "../../song_table/states/commonSongTableState";
import { fetchPlaylistSongs } from "../helpers/api";

import { selectedPlaylistAtom } from "./playlist";

const playlistSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const selectedPlaylist = get(selectedPlaylistAtom);

  if (currentMpdProfile === undefined || selectedPlaylist === undefined) {
    return [];
  }

  return await fetchPlaylistSongs(
    mpdClient,
    currentMpdProfile,
    selectedPlaylist,
  );
});

const playlistVisibleSongsAtom = atom(async (get) => {
  const playlistSongs = await get(playlistSongsAtom);
  const commonSongTableState = await get(commonSongTableStateAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_PLAYLIST) {
    return playlistSongs;
  }

  const filteredSongs = filterSongsByGlobalFilter(
    playlistSongs,
    globalFilterTokens,
    commonSongTableState.columns,
  );
  return filteredSongs;
});

const unwrappedPlaylistVisibleSongsAtom = unwrap(
  playlistVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useRefreshPlaylistSongsState() {
  return useSetAtom(playlistSongsAtom);
}

export function usePlaylistVisibleSongsState() {
  return useAtomValue(unwrappedPlaylistVisibleSongsAtom);
}
