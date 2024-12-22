import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useAtomValue } from "jotai";
import { atomWithDefault, selectAtom, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { mpdProfileStateRepositoryAtom } from "./mpdProfileStateRepository";

const mpdProfileStateAtom = atomWithDefault(async (get) => {
  const repository = get(mpdProfileStateRepositoryAtom);
  return repository.fetch();
});

const mpdProfileStateSyncAtom = atomWithSync(mpdProfileStateAtom);

export const currentMpdProfileAtom = selectAtom(
  mpdProfileStateSyncAtom,
  (profileState: MpdProfileState) => profileState.currentProfile,
);

export function useMpdProfileState() {
  return useAtomValue(mpdProfileStateSyncAtom);
}

export function useCurrentMpdProfileState() {
  return useAtomValue(currentMpdProfileAtom);
}

export function useRefreshMpdProfileState() {
  return useResetAtom(mpdProfileStateAtom);
}

export function useSaveCurrentMpdProfile() {
  const mpdProfileState = useAtomValue(mpdProfileStateAtom);
  const repository = useAtomValue(mpdProfileStateRepositoryAtom);

  return useCallback(
    async (mpdProfile: MpdProfile) => {
      if (!mpdProfileState.profiles.includes(mpdProfile)) {
        throw Error(
          `Invalid profile state: ${mpdProfile.toJsonString()} is not in profiles`,
        );
      }
      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.currentProfile = mpdProfile;
      await repository.save(newMpdProfileState);
    },
    [mpdProfileState, repository],
  );
}
