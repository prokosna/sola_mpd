import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { useAtomValue } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { browserStateRepositoryAtom } from "./browserStateRepository";

const browserStateAtom = atomWithDefault(async (get) => {
  const repository = get(browserStateRepositoryAtom);
  const browserState = await repository.fetch();
  return browserState;
});
const browserStateSyncAtom = atomWithSync(browserStateAtom);

/**
 * Returns the current browser state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current browser state.
 */
export function useBrowserState(): BrowserState {
  return useAtomValue(browserStateSyncAtom);
}

/**
 * Returns a function to call to save a state.
 *
 * The state is automatically persisted.
 * @returns Function to call to save a state.
 */
export function useSaveBrowserState(): (state: BrowserState) => Promise<void> {
  const repository = useAtomValue(browserStateRepositoryAtom);

  return useCallback(
    async (state: BrowserState): Promise<void> => {
      await repository.save(state);
    },
    [repository],
  );
}

/**
 * Refreshes the browser state to its initial state.
 * @returns A function to refresh the browser state.
 */
export function useRefreshBrowserState(): () => void {
  return useResetAtom(browserStateAtom);
}
