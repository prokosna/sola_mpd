import { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { recentlyAddedStateRepositoryAtom } from "./recentlyAddedStateRepository";

const recentlyAddedStateAtom = atomWithDefault<
  Promise<RecentlyAddedState> | RecentlyAddedState
>(async (get) => {
  const repository = get(recentlyAddedStateRepositoryAtom);
  const recentlyAddedState = await repository.fetch();
  return recentlyAddedState;
});

export const recentlyAddedStateSyncAtom = atomWithSync(recentlyAddedStateAtom);

/**
 * Returns the current recently added state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current recently added state.
 */
export function useRecentlyAddedState() {
  return useAtomValue(recentlyAddedStateSyncAtom);
}

/**
 * Returns a function to update recently added state.
 * @returns Function to call to update a state.
 */
export function useUpdateRecentlyAddedState() {
  const setRecentlyAddedState = useSetAtom(recentlyAddedStateAtom);
  const repository = useAtomValue(recentlyAddedStateRepositoryAtom);

  return useCallback(
    async (state: RecentlyAddedState, mode: UpdateMode) => {
      if (mode & UpdateMode.LOCAL_STATE) {
        setRecentlyAddedState(state);
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(state);
      }
    },
    [setRecentlyAddedState, repository],
  );
}

/**
 * Refreshes the recently added state to its initial state.
 * @returns A function to refresh the recently added state.
 */
export function useRefreshRecentlyAddedState(): () => void {
  return useResetAtom(recentlyAddedStateAtom);
}
