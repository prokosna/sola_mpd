import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { mpdProfileStateRepositoryAtom } from "./mpdProfileStateRepository";

const mpdProfileStateAtom = atomWithDefault(async (get) => {
  const repository = get(mpdProfileStateRepositoryAtom);
  return repository.fetch();
});

const mpdProfileStateSyncAtom = atomWithSync(mpdProfileStateAtom);

export const currentMpdProfileSyncAtom = atom(async (get) => {
  const profileState = await get(mpdProfileStateSyncAtom);
  return profileState.currentProfile;
});

/**
 * Hook to access the MPD profile state.
 * @returns The MPD profile state.
 */
export function useMpdProfileState() {
  return useAtomValue(mpdProfileStateSyncAtom);
}

/**
 * Hook to access the current MPD profile.
 * @returns The current MPD profile.
 */
export function useCurrentMpdProfileState() {
  return useAtomValue(currentMpdProfileSyncAtom);
}

/**
 * Hook to refresh the MPD profile state.
 * @returns A function to refresh the MPD profile state.
 */
export function useRefreshMpdProfileState() {
  return useResetAtom(mpdProfileStateAtom);
}

/**
 * Hook to save the MPD profile state.
 * @returns A function to save the MPD profile state.
 */
export function useUpdateMpdProfileState() {
  const repository = useAtomValue(mpdProfileStateRepositoryAtom);
  const setMpdProfileState = useSetAtom(mpdProfileStateAtom);

  return useCallback(
    async (newMpdProfileState: MpdProfileState, mode: UpdateMode) => {
      await repository.save(newMpdProfileState);
      if (mode & UpdateMode.LOCAL_STATE) {
        setMpdProfileState(Promise.resolve(newMpdProfileState));
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(newMpdProfileState);
      }
    },
    [repository, setMpdProfileState],
  );
}

/**
 * Hook to save the current MPD profile.
 * @returns A function to save the current MPD profile.
 * @throws Error if the provided profile is not in the list of profiles.
 */
export function useUpdateCurrentMpdProfile() {
  const mpdProfileState = useAtomValue(mpdProfileStateAtom);
  const repository = useAtomValue(mpdProfileStateRepositoryAtom);
  const setMpdProfileState = useSetAtom(mpdProfileStateAtom);

  return useCallback(
    async (mpdProfile: MpdProfile, mode: UpdateMode) => {
      if (!mpdProfileState.profiles.includes(mpdProfile)) {
        throw Error(
          `Invalid profile state: ${mpdProfile.toJsonString()} is not in profiles`,
        );
      }
      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.currentProfile = mpdProfile;
      if (mode & UpdateMode.LOCAL_STATE) {
        setMpdProfileState(Promise.resolve(newMpdProfileState));
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(newMpdProfileState);
      }
    },
    [mpdProfileState, repository, setMpdProfileState],
  );
}
