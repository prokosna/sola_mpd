import { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchFileExploreFolders } from "../utils/fileExploreFoldersUtils";

const fileExploreFoldersAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return [];
  }

  return await fetchFileExploreFolders(mpdClient, profile);
});

const fileExploreFoldersSyncAtom = atomWithSync(fileExploreFoldersAtom);

export const selectedFileExploreFolderAtom = atom<Folder | undefined>(
  undefined,
);

/**
 * Hook to access the current state of file explorer folders.
 *
 * This hook retrieves the synchronized state of file explorer folders,
 * which is automatically updated when the underlying data changes.
 *
 * @returns An array of Folder objects representing the current state of file explorer folders.
 */
export function useFileExploreFoldersState() {
  return useAtomValue(fileExploreFoldersSyncAtom);
}

/**
 * Hook to access the current selected file explorer folder state.
 *
 * This hook retrieves the current selected folder in the file explorer,
 * which is automatically updated when the underlying data changes.
 *
 * @returns A Folder object representing the current selected folder in the file explorer, or undefined if no folder is selected.
 */
export function useSelectedFileExploreFolderState() {
  return useAtomValue(selectedFileExploreFolderAtom);
}

/**
 * Hook to set the selected file explorer folder state.
 *
 * This hook returns a function that can be used to update the selected folder
 * in the file explorer. It uses the `selectedFileExploreFolderAtom` to manage
 * the state of the selected folder.
 *
 * @returns A function that takes a Folder object and updates the selected folder state.
 */
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

/**
 * Hook to refresh the file explorer folders.
 *
 * This hook returns a function that can be used to trigger a refresh of the file explorer folders.
 * It utilizes the `fileExploreFoldersAtom` to manage the state and refresh mechanism.
 *
 * @returns A function that, when called, refreshes the file explorer folders state.
 */
export function useRefreshFileExploreFolders() {
  return useSetAtom(fileExploreFoldersAtom);
}
