import { useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerVolume } from "../utils/playerUtils";

/**
 * Base atom for player volume state.
 *
 * Fetches volume level from MPD server with profile-based
 * access control. Returns undefined if no profile selected.
 */
const playerVolumeAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchPlayerVolume(mpdClient, profile);
});

/**
 * Synchronized atom for player volume state.
 *
 * Ensures consistent updates across all subscribers when
 * the volume level changes.
 */
const playerVolumeSyncAtom = atomWithSync(playerVolumeAtom);

/**
 * Hook for accessing volume state.
 *
 * Provides read-only access to current volume level.
 * Auto-updates when volume changes through MPD.
 *
 * @returns Volume (0-100) or undefined
 */
export function usePlayerVolumeState() {
  return useAtomValue(playerVolumeSyncAtom);
}

/**
 * Hook for refreshing volume state.
 *
 * Returns function to trigger fresh fetch from MPD server.
 * Useful for manual refresh or error recovery.
 *
 * @returns Refresh function
 */
export function useRefreshPlayerVolumeState() {
  return useSetAtom(playerVolumeAtom);
}
