import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { songTableStateRepositoryAtom } from "./songTableStateRepository";

const songTableStateAtom = atomWithDefault<
  Promise<SongTableState> | SongTableState
>(async (get) => {
  const repository = get(songTableStateRepositoryAtom);
  const songTableState = await repository.fetch();
  return songTableState;
});

export const songTableStateSyncAtom = atomWithSync(songTableStateAtom);

/**
 * Uses the SongTableState which is commonly used across tables. Promise will be returned only at the beginning.
 * @returns SongTableState.
 */
export function useSongTableState() {
  return useAtomValue(songTableStateSyncAtom);
}

/**
 * Returns a function to update song table state.
 *
 * The state is automatically updated and persisted with 1 second debounce.
 * @returns Function to call to update a state.
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
