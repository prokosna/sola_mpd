import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { songTableStateRepositoryAtom } from "./songTableStateRepository";

export const songTableStateAtom = atomWithDefault(async (get) => {
  const repository = get(songTableStateRepositoryAtom);
  const songTableState = await repository.fetch();
  return songTableState;
});

export const songTableStateSyncAtom = atomWithSync(songTableStateAtom);

export const saveSongTableStateAtom = atom(
  null,
  async (get, _, newState: SongTableState): Promise<void> => {
    const repository = get(songTableStateRepositoryAtom);
    await repository.save(newState);
  },
);

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
  return useSetAtom(saveSongTableStateAtom);
}

/**
 * Returns a function to call to reset a state.
 * @returns Function to call to reset a state.
 */
export function useResetSongTableState(): () => void {
  return useResetAtom(songTableStateAtom);
}
