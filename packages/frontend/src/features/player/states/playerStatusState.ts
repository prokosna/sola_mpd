import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithRefresh } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { mpdClientAtom } from "../../mpd/states/mpdClient";
import { currentMpdProfileSyncAtom } from "../../profile/states/mpdProfileState";
import { fetchPlayerStatus } from "../utils/playerUtils";

const playerStatusAtom = atomWithRefresh(async (get) => {
  const mpdClient = get(mpdClientAtom);
  const profile = get(currentMpdProfileSyncAtom);

  if (profile === undefined) {
    return undefined;
  }

  return await fetchPlayerStatus(mpdClient, profile);
});

const playerStatusSyncAtom = atomWithSync(playerStatusAtom);

const playerStatusPlaybackStateSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.playbackState;
});

const playerStatusIsConsumeSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isConsume;
});

const playerStatusIsRandomSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isRandom;
});

const playerStatusIsRepeatSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isRepeat;
});

const playerStatusIsSingleSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isSingle;
});

const playerStatusIsDatabaseUpdatingSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.isDatabaseUpdating;
});

const playerStatusElapsedSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.elapsed;
});

const playerStatusDurationSyncAtom = atom((get) => {
  return get(playerStatusSyncAtom)?.duration;
});

export function usePlayerStatusPlaybackState() {
  return useAtomValue(playerStatusPlaybackStateSyncAtom);
}

export function usePlayerStatusIsConsumeState() {
  return useAtomValue(playerStatusIsConsumeSyncAtom);
}

export function usePlayerStatusIsRandomState() {
  return useAtomValue(playerStatusIsRandomSyncAtom);
}

export function usePlayerStatusIsRepeatState() {
  return useAtomValue(playerStatusIsRepeatSyncAtom);
}

export function usePlayerStatusIsSingleState() {
  return useAtomValue(playerStatusIsSingleSyncAtom);
}

export function usePlayerStatusIsDatabaseUpdatingState() {
  return useAtomValue(playerStatusIsDatabaseUpdatingSyncAtom);
}

export function usePlayerStatusElapsedState() {
  return useAtomValue(playerStatusElapsedSyncAtom);
}

export function usePlayerStatusDurationState() {
  return useAtomValue(playerStatusDurationSyncAtom);
}

/**
 * Returns a function to refresh the player status state.
 * This hook can be used to trigger a re-fetch of the player status.
 * @returns A function that, when called, will refresh the player status state.
 */
export function useRefreshPlayerStatusState() {
  return useSetAtom(playerStatusAtom);
}
