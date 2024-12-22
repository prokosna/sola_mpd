import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { useDeepProtoMemo } from "../../../lib/proto/hooks/useDeepProtoMemo";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerStatus } from "../helpers/api";

const playerStatusAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return undefined;
  }

  return await fetchPlayerStatus(mpdClient, currentMpdProfile);
});

const unwrappedPlayerStatusAtom = unwrap(
  playerStatusAtom,
  (prev) => prev || undefined,
);

export function useRefreshPlayerStatusState() {
  return useSetAtom(playerStatusAtom);
}

export function usePlayerStatusState() {
  const playerStatus = useAtomValue(unwrappedPlayerStatusAtom);
  return useDeepProtoMemo(playerStatus);
}
