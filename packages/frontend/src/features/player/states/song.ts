import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { useDeepProtoMemo } from "../../../lib/proto/hooks/useDeepProtoMemo";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { fetchCurrentSong } from "../helpers/api";

const currentSongAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return undefined;
  }

  return await fetchCurrentSong(mpdClient, currentMpdProfile);
});

const unwrappedCurrentSongAtom = unwrap(
  currentSongAtom,
  (prev) => prev || undefined,
);

export function useRefreshCurrentSongState() {
  return useSetAtom(currentSongAtom);
}

export function useCurrentSongState() {
  const currentSong = useAtomValue(unwrappedCurrentSongAtom);
  return useDeepProtoMemo(currentSong);
}
