import { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { fetchFileExploreFolders } from "../helpers/api";

const fileExploreFoldersAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return [];
  }

  return await fetchFileExploreFolders(mpdClient, currentMpdProfile);
});

const unwrappedFileExploreFoldersAtom = unwrap(
  fileExploreFoldersAtom,
  (prev) => prev || undefined,
);

const selectedFileExploreFolderAtom = atom<Folder | undefined>(undefined);

export { selectedFileExploreFolderAtom };

export function useFileExploreFoldersState() {
  return useAtomValue(unwrappedFileExploreFoldersAtom);
}

export function useSetSelectedFileExploreFolderState() {
  const setSelectedFileExploreFolder = useSetAtom(
    selectedFileExploreFolderAtom,
  );

  return useCallback(
    async (folder: Folder) => {
      setSelectedFileExploreFolder(folder);
    },
    [setSelectedFileExploreFolder],
  );
}

export function useRefreshFileExploreFolders() {
  return useSetAtom(fileExploreFoldersAtom);
}
