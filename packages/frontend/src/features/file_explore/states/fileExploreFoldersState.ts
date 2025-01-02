import type { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchFileExploreFolders } from "../utils/fileExploreFoldersUtils";

/**
 * Base atom for managing file explorer folder data.
 * Fetches folder structure from MPD server.
 */
const fileExploreFoldersAtom = atomWithRefresh(async (get) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileSyncAtom);

	if (profile === undefined) {
		return [];
	}

	return await fetchFileExploreFolders(mpdClient, profile);
});

/**
 * Synchronized atom for folder data with persistence support.
 */
const fileExploreFoldersSyncAtom = atomWithSync(fileExploreFoldersAtom);

/**
 * Atom for tracking the currently selected folder.
 * Defaults to undefined when no folder is selected.
 */
export const selectedFileExploreFolderAtom = atom<Folder | undefined>(
	undefined,
);

/**
 * Hook to access the file explorer folder structure.
 *
 * Features:
 * - Automatic updates on data changes
 * - MPD server integration
 * - Profile-aware data fetching
 *
 * @returns Array of folders or empty array if no profile
 */
export function useFileExploreFoldersState() {
	return useAtomValue(fileExploreFoldersSyncAtom);
}

/**
 * Hook to access the currently selected folder.
 *
 * Features:
 * - Selection state tracking
 * - Type-safe folder access
 * - Automatic state updates
 *
 * @returns Selected folder or undefined if none selected
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
 * Hook to refresh folder data from the MPD server.
 *
 * Features:
 * - Manual refresh trigger
 * - Profile-aware refresh
 * - Error handling
 *
 * @returns Refresh function to trigger new data fetch
 */
export function useRefreshFileExploreFolders() {
	return useSetAtom(fileExploreFoldersAtom);
}
