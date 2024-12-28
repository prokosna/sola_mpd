import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerVolume } from "../utils/playerUtils";

const playerVolumeAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = await get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchPlayerVolume(mpdClient, profile);
});

const playerVolumeSyncAtom = atomWithSync(playerVolumeAtom);

/**
 * Custom hook to access the current player volume state.
 * This hook retrieves the synchronized player volume from the atom.
 * @returns The current player volume or undefined if not available.
 */
export function usePlayerVolumeState() {
  return useAtomValue(playerVolumeSyncAtom);
}

/**
 * Returns a function to refresh the player volume state.
 * This hook can be used to trigger a re-fetch of the player volume.
 * @returns A function that, when called, will refresh the player volume state.
 */
export function useRefreshPlayerVolumeState() {
  return useSetAtom(playerVolumeAtom);
}
