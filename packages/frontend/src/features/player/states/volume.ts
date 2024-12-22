import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerVolume } from "../helpers/api";

const playerVolumeAtom = atomWithRefresh(async (get) => {
  const mpdClient = await get(mpdClientAtom);
  const currentMpdProfile = await get(currentMpdProfileAtom);

  if (currentMpdProfile === undefined) {
    return undefined;
  }

  return await fetchPlayerVolume(mpdClient, currentMpdProfile);
});

const unwrappedPlayerVolumeAtom = unwrap(
  playerVolumeAtom,
  (prev) => prev || undefined,
);

export function useRefreshPlayerVolumeState() {
  return useSetAtom(playerVolumeAtom);
}

export function usePlayerVolumeState() {
  return useAtomValue(unwrappedPlayerVolumeAtom);
}
