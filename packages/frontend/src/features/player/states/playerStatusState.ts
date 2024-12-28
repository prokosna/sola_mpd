import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerStatus } from "../utils/playerUtils";

const playerStatusAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchPlayerStatus(mpdClient, profile);
});

const playerStatusSyncAtom = atomWithSync(playerStatusAtom);

/**
 * Custom hook to access the current player status state.
 * This hook retrieves the synchronized player status from the atom.
 * @returns The current MpdPlayerStatus object or undefined if not available.
 */
export function usePlayerStatusState() {
  return useAtomValue(playerStatusSyncAtom);
}

/**
 * Returns a function to refresh the player status state.
 * This hook can be used to trigger a re-fetch of the player status.
 * @returns A function that, when called, will refresh the player status state.
 */
export function useRefreshPlayerStatusState() {
  return useSetAtom(playerStatusAtom);
}
