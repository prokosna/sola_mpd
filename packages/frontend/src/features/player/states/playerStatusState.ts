import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerStatus } from "../utils/playerUtils";

/**
 * Base atom for player status state.
 *
 * Fetches status from MPD server with profile-based
 * access control. Returns undefined if no profile selected.
 */
const playerStatusAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchPlayerStatus(mpdClient, profile);
});

/**
 * Synchronized atom for player status state.
 *
 * Ensures consistent updates across all subscribers when
 * the player status changes.
 */
const playerStatusSyncAtom = atomWithSync(playerStatusAtom);

/**
 * Atom for current playback state.
 *
 * Provides play, pause, or stop state from player status.
 */
const playerStatusPlaybackStateSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.playbackState;
});

/**
 * Atom for consume mode state.
 *
 * Indicates if played songs are removed from queue.
 */
const playerStatusIsConsumeSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isConsume;
});

/**
 * Atom for random mode state.
 *
 * Indicates if songs are played in random order.
 */
const playerStatusIsRandomSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isRandom;
});

/**
 * Atom for repeat mode state.
 *
 * Indicates if playlist repeats after reaching the end.
 */
const playerStatusIsRepeatSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isRepeat;
});

/**
 * Atom for single mode state.
 *
 * Indicates if player stops after current song.
 */
const playerStatusIsSingleSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isSingle;
});

/**
 * Atom for database update state.
 *
 * Indicates if MPD is currently updating its database.
 */
const playerStatusIsDatabaseUpdatingSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isDatabaseUpdating;
});

/**
 * Atom for elapsed time state.
 *
 * Current position in song in seconds.
 */
const playerStatusElapsedSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.elapsed;
});

/**
 * Atom for song duration state.
 *
 * Total length of current song in seconds.
 */
const playerStatusDurationSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.duration;
});

/**
 * Hook for current playback state.
 * @returns Current state (play/pause/stop) or undefined
 */
export function usePlayerStatusPlaybackState() {
  return useAtomValue(playerStatusPlaybackStateSyncAtom);
}

/**
 * Hook for consume mode state.
 * @returns True if enabled, false otherwise
 */
export function usePlayerStatusIsConsumeState() {
  return useAtomValue(playerStatusIsConsumeSyncAtom);
}

/**
 * Hook for random mode state.
 * @returns True if enabled, false otherwise
 */
export function usePlayerStatusIsRandomState() {
  return useAtomValue(playerStatusIsRandomSyncAtom);
}

/**
 * Hook for repeat mode state.
 * @returns True if enabled, false otherwise
 */
export function usePlayerStatusIsRepeatState() {
  return useAtomValue(playerStatusIsRepeatSyncAtom);
}

/**
 * Hook for single mode state.
 * @returns True if enabled, false otherwise
 */
export function usePlayerStatusIsSingleState() {
  return useAtomValue(playerStatusIsSingleSyncAtom);
}

/**
 * Hook for database update state.
 * @returns True if updating, false otherwise
 */
export function usePlayerStatusIsDatabaseUpdatingState() {
  return useAtomValue(playerStatusIsDatabaseUpdatingSyncAtom);
}

/**
 * Hook for elapsed time state.
 * @returns Time in seconds or undefined
 */
export function usePlayerStatusElapsedState() {
  return useAtomValue(playerStatusElapsedSyncAtom);
}

/**
 * Hook for song duration state.
 * @returns Time in seconds or undefined
 */
export function usePlayerStatusDurationState() {
  return useAtomValue(playerStatusDurationSyncAtom);
}

/**
 * Hook for refreshing player status.
 *
 * Returns function to trigger fresh fetch from MPD server.
 * Useful for manual refresh or error recovery.
 *
 * @returns Refresh function
 */
export function useRefreshPlayerStatusState() {
  return useSetAtom(playerStatusAtom);
}
