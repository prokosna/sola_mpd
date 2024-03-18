import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/persistent";
import { fetchStats } from "../helpers/api";

const statsAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return undefined;
  }

  return await fetchStats(mpdClient, currentMpdProfile);
});

const unwrappedStatsAtom = unwrap(statsAtom, (prev) => prev || undefined);

export function useStatsState() {
  return useAtomValue(unwrappedStatsAtom);
}

export function useRefreshStatsState() {
  return useSetAtom(statsAtom);
}
