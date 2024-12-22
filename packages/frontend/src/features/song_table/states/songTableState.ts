import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useAtomValue } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { songTableStateRepositoryAtom } from "./songTableStateRepository";

const songTableStateAtom = atomWithDefault(async (get) => {
  const repository = get(songTableStateRepositoryAtom);
  const songTableState = await repository.fetch();
  return songTableState;
});

const songTableStateSyncAtom = atomWithSync(songTableStateAtom);

/**
 * Uses the SongTableState which is commonly used across tables. Promise will be returned only at the beginning.
 * @returns SongTableState.
 */
export function useSongTableState(): SongTableState {
  return useAtomValue(songTableStateSyncAtom);
}

/**
 * Returns a function to call to save a state.
 * @returns Function to call to save a state.
 */
export function useSaveSongTableState(): (
  state: SongTableState,
) => Promise<void> {
  const repository = useAtomValue(songTableStateRepositoryAtom);

  return useCallback(
    async (state: SongTableState): Promise<void> => {
      await repository.save(state);
    },
    [repository],
  );
}

/**
 * Returns a function to call to refresh a state.
 * @returns Function to call to refresh a state.
 */
export function useRefreshSongTableState(): () => void {
  return useResetAtom(songTableStateAtom);
}
