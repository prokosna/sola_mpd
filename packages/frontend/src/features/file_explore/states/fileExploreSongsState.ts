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

const fileExploreSongsSyncAtom = atomWithSync(fileExploreSongsAtom);

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
 * Hook to access the current visible songs state in the file explorer.
 *
 * This hook retrieves the sorted and filtered list of songs based on the
 * current file explorer state, global filter, and song table configuration.
 *
 * @returns An array of Song objects representing the visible songs in the file explorer.
 */
export function useFileExploreSongsState() {
  return useAtomValue(fileExploreVisibleSongsSyncAtom);
}
