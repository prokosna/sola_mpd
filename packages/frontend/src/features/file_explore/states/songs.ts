import { atom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";

import { ROUTE_HOME_FILE_EXPLORE } from "../../../const/routes";
import { filterSongsByGlobalFilter } from "../../global_filter";
import { globalFilterTokensAtom } from "../../global_filter/states/filter";
import { pathnameAtom } from "../../location/states/location";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";
import { commonSongTableStateAtom } from "../../song_table/states/commonSongTableState";
import { fetchFileExploreSongs } from "../helpers/api";

import { selectedFileExploreFolderAtom } from "./folders";

const fileExploreSongsAtom = atom(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);
  const selectedFileExploreFolder = get(selectedFileExploreFolderAtom);

  if (
    currentMpdProfile === undefined ||
    selectedFileExploreFolder === undefined
  ) {
    return [];
  }

  return await fetchFileExploreSongs(
    mpdClient,
    currentMpdProfile,
    selectedFileExploreFolder,
  );
});

const fileExploreVisibleSongsAtom = atom(async (get) => {
  const fileExploreSongs = await get(fileExploreSongsAtom);
  const commonSongTableState = await get(commonSongTableStateAtom);
  const globalFilterTokens = get(globalFilterTokensAtom);
  const pathname = get(pathnameAtom);

  if (pathname !== ROUTE_HOME_FILE_EXPLORE) {
    return fileExploreSongs.toSorted((a, b) => (a.path > b.path ? 1 : -1));
  }

  const filteredSongs = filterSongsByGlobalFilter(
    fileExploreSongs,
    globalFilterTokens,
    commonSongTableState.columns,
  );
  return filteredSongs.toSorted((a, b) => (a.path > b.path ? 1 : -1));
});

const unwrappedFileExploreVisibleSongsAtom = unwrap(
  fileExploreVisibleSongsAtom,
  (prev) => prev || undefined,
);

export function useFileExploreVisibleSongsState() {
  return useAtomValue(unwrappedFileExploreVisibleSongsAtom);
}
