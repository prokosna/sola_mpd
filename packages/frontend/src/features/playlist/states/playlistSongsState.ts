import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { ROUTE_HOME_PLAYLIST } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchPlaylistSongs } from "../utils/playlistUtils";

import { selectedPlaylistAtom } from "./playlistState";

const playlistSongsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);
  const selectedPlaylist = get(selectedPlaylistAtom);

  if (profile === undefined || selectedPlaylist === undefined) {
    return [];
  }

  const songs = await fetchPlaylistSongs(mpdClient, profile, selectedPlaylist);

  return songs;
});

const playlistSongsSyncAtom = atomWithSync(playlistSongsAtom);

const playlistVisibleSongsSyncAtom = atom(async (get) => {
  const playlistSongs = await get(playlistSongsSyncAtom);
  const songTableState = await get(songTableStateSyncAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_PLAYLIST) {
    return [];
  }

  const filteredSongs = filterSongsByGlobalFilter(
    playlistSongs,
    globalFilterTokens,
    songTableState.columns,
  );

  return filteredSongs;
});

/**
 * A hook that returns the current visible songs in the playlist.
 * This includes filtering based on the global filter and the current route.
 * @returns An array of Song objects representing the visible songs in the playlist.
 */
export function usePlaylistSongsState() {
  return useAtomValue(playlistVisibleSongsSyncAtom);
}

/**
 * Returns a function to refresh the playlist songs state.
 * This hook can be used to trigger a re-fetch of the playlist songs.
 * @returns A function that, when called, will refresh the playlist songs state.
 */
export function useRefreshPlaylistSongsState() {
  return useSetAtom(playlistSongsAtom);
}
