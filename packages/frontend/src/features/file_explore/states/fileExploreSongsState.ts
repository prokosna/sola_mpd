import { atom, useAtomValue } from "jotai";

import { ROUTE_HOME_FILE_EXPLORE } from "../../../const/routes";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/globalFilterState";
import { pathnameAtom } from "../../location/states/locationState";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { songTableStateSyncAtom } from "../../song_table/states/songTableState";
import { fetchFileExploreSongs } from "../utils/fileExploreSongsUtils";

import { selectedFileExploreFolderAtom } from "./fileExploreFoldersState";

/**
 * Base atom for managing file explorer songs.
 *
 * Features:
 * - MPD server integration
 * - Profile-aware data fetching
 * - Folder-based song filtering
 * - Empty state handling
 *
 * Dependencies:
 * - MPD client connection
 * - Current MPD profile
 * - Selected folder path
 */
const fileExploreSongsAtom = atom(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);
  const selectedFileExploreFolder = get(selectedFileExploreFolderAtom);

  if (profile === undefined) {
    return undefined;
  }
  if (selectedFileExploreFolder === undefined) {
    return [];
  }

  const songs = await fetchFileExploreSongs(
    mpdClient,
    profile,
    selectedFileExploreFolder,
  );

  return songs;
});

/**
 * Synchronized atom for songs data with persistence support.
 */
const fileExploreSongsSyncAtom = atomWithSync(fileExploreSongsAtom);

/**
 * Derived atom for visible songs with filtering applied.
 *
 * Features:
 * - Global filter integration
 * - Route-aware filtering
 * - Song table state sync
 * - Empty state handling
 */
const fileExploreVisibleSongsSyncAtom = atom((get) => {
  const fileExploreSongs = get(fileExploreSongsSyncAtom);
  const songTableState = get(songTableStateSyncAtom);
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
  const sortedSongs = filteredSongs.toSorted((a, b) =>
    a.path > b.path ? 1 : -1,
  );

  return sortedSongs;
});

/**
 * Hook to access the filtered and sorted songs in file explorer.
 *
 * Features:
 * - Automatic updates on data changes
 * - Global filter integration
 * - Route-aware visibility
 * - Sort state handling
 *
 * @returns Filtered array of songs or undefined if not ready
 */
export function useFileExploreSongsState() {
  return useAtomValue(fileExploreVisibleSongsSyncAtom);
}
