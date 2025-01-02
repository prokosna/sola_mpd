import type { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { songTableStateRepositoryAtom } from "./songTableStateRepository";

/**
 * Global state atom for song table configuration.
 *
 * Initializes with persisted state from repository, managing
 * column settings, sorting, and view preferences across tables.
 */
const songTableStateAtom = atomWithDefault<
	Promise<SongTableState> | SongTableState
>(async (get) => {
	const repository = get(songTableStateRepositoryAtom);
	const songTableState = await repository.fetch();
	return songTableState;
});

/**
 * Synchronized atom for song table state.
 *
 * Wraps base atom with synchronization capabilities to ensure
 * consistent state across components and persist changes.
 */
export const songTableStateSyncAtom = atomWithSync(songTableStateAtom);

/**
 * Hook to access song table configuration.
 *
 * Retrieves current table state including column settings,
 * sorting preferences, and view mode. Returns Promise only
 * during initial load.
 *
 * @returns Current table state
 */
export function useSongTableState() {
	return useAtomValue(songTableStateSyncAtom);
}

/**
 * Hook to update song table configuration.
 *
 * Updates table state locally and/or persists to storage based
 * on update mode. Changes are debounced by 1 second to prevent
 * excessive storage operations.
 *
 * @returns Table state update function
 */
export function useUpdateSongTableState() {
	const repository = useAtomValue(songTableStateRepositoryAtom);
	const setSongTableState = useSetAtom(songTableStateAtom);

	return useCallback(
		async (state: SongTableState, mode: UpdateMode): Promise<void> => {
			if (mode & UpdateMode.LOCAL_STATE) {
				setSongTableState(state);
			}
			if (mode & UpdateMode.PERSIST) {
				await repository.save(state);
			}
		},
		[repository, setSongTableState],
	);
}

/**
 * Returns a function to call to refresh a state.
 * @returns Function to call to refresh a state.
 */
export function useRefreshSongTableState(): () => void {
	return useResetAtom(songTableStateAtom);
}
