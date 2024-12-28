import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchStats } from "../utils/statsUtils";

const statsAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchStats(mpdClient, profile);
});

const statsSyncAtom = atomWithSync(statsAtom);

/**
 * Hook to access the current stats state.
 * @returns The current stats state.
 */
export function useStatsState() {
  return useAtomValue(statsSyncAtom);
}

/**
 * Hook to refresh the stats state.
 * @returns A function to refresh the stats state.
 */
export function useRefreshStatsState() {
  return useSetAtom(statsAtom);
}
