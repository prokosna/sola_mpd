import type { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../../types/stateTypes";

import { browserStateRepositoryAtom } from "./browserStateRepository";

/**
 * Base atom for browser state with repository integration.
 * Initializes with data from the repository.
 */
const browserStateAtom = atomWithDefault<Promise<BrowserState> | BrowserState>(
	async (get) => {
		const repository = get(browserStateRepositoryAtom);
		const browserState = await repository.fetch();
		return browserState;
	},
);

/**
 * Synchronized atom for browser state with persistence support.
 */
export const browserStateSyncAtom = atomWithSync(browserStateAtom);

/**
 * Hook to access the current browser state.
 *
 * Features:
 * - Automatic updates on storage changes
 * - Repository integration
 * - Type-safe state access
 *
 * @returns Current browser state or undefined
 */
export function useBrowserState() {
	return useAtomValue(browserStateSyncAtom);
}

/**
 * Hook to update the browser state with flexible persistence options.
 *
 * Features:
 * - Local state updates
 * - Optional persistence to storage
 * - Update mode control
 *
 * @returns Function to update browser state
 */
export function useUpdateBrowserState() {
	const setBrowserState = useSetAtom(browserStateAtom);
	const repository = useAtomValue(browserStateRepositoryAtom);

	return useCallback(
		async (state: BrowserState, mode: UpdateMode) => {
			if (mode & UpdateMode.LOCAL_STATE) {
				setBrowserState(state);
			}
			if (mode & UpdateMode.PERSIST) {
				await repository.save(state);
			}
		},
		[setBrowserState, repository],
	);
}

/**
 * Refreshes the browser state to its initial state.
 * @returns A function to refresh the browser state.
 */
export function useRefreshBrowserState(): () => void {
	return useResetAtom(browserStateAtom);
}
