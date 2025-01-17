import type { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../../types/stateTypes";

import { recentlyAddedStateRepositoryAtom } from "./recentlyAddedStateRepository";

/**
 * Recently added state management.
 */
const recentlyAddedStateAtom = atomWithDefault<
	Promise<RecentlyAddedState> | RecentlyAddedState
>(async (get) => {
	const repository = get(recentlyAddedStateRepositoryAtom);
	const recentlyAddedState = await repository.fetch();
	return recentlyAddedState;
});

/**
 * Synchronized recently added state.
 */
export const recentlyAddedStateSyncAtom = atomWithSync(recentlyAddedStateAtom);

/**
 * Get recently added state.
 *
 * @returns Current state
 */
export function useRecentlyAddedState() {
	return useAtomValue(recentlyAddedStateSyncAtom);
}

/**
 * Update recently added state.
 *
 * @returns State updater
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
 * Refresh recently added state.
 *
 * @returns Refresh function
 */
export function useRefreshRecentlyAddedState(): () => void {
	return useResetAtom(recentlyAddedStateAtom);
}
