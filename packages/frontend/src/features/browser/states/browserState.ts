import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { browserStateRepositoryAtom } from "./browserStateRepository";

const browserStateAtom = atomWithDefault(async (get) => {
  const repository = get(browserStateRepositoryAtom);
  const browserState = await repository.fetch();
  return browserState;
});

export const browserStateSyncAtom = atomWithSync(browserStateAtom);

/**
 * Returns the current browser state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current browser state.
 */
export function useBrowserState() {
  return useAtomValue(browserStateSyncAtom);
}

/**
 * Returns a function to update browser state.
 * @returns Function to call to update a state.
 */
export function useUpdateBrowserState() {
  const setBrowserState = useSetAtom(browserStateAtom);
  const repository = useAtomValue(browserStateRepositoryAtom);

  return useCallback(
    async (state: BrowserState, mode: UpdateMode) => {
      if (mode & UpdateMode.LOCAL_STATE) {
        setBrowserState(Promise.resolve(state));
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
