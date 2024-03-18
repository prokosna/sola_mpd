import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { fetchMpdProfileState, sendMpdProfileState } from "../helpers/api";

const mpdProfileStateAtom = atomWithRefresh(async (_get) => {
  return await fetchMpdProfileState();
});

const unwrappedMpdProfileStateAtom = unwrap(
  mpdProfileStateAtom,
  (prev) => prev || undefined,
);

const currentMpdProfileAtom = atom(async (get) => {
  const profile = await get(mpdProfileStateAtom);
  return profile.currentProfile;
});

const unwrappedCurrentMpdProfileAtom = unwrap(
  currentMpdProfileAtom,
  (prev) => prev || undefined,
);

export { mpdProfileStateAtom, currentMpdProfileAtom };

export function useMpdProfileState() {
  return useAtomValue(unwrappedMpdProfileStateAtom);
}

export function useCurrentMpdProfileState() {
  return useAtomValue(unwrappedCurrentMpdProfileAtom);
}

export function useSetMpdProfileState() {
  const refresh = useSetAtom(mpdProfileStateAtom);

  return useCallback(
    async (mpdProfileState: MpdProfileState) => {
      await sendMpdProfileState(mpdProfileState);
      refresh();
    },
    [refresh],
  );
}

export function useSetCurrentMpdProfile() {
  const [mpdProfileState, refresh] = useAtom(mpdProfileStateAtom);

  return useCallback(
    async (mpdProfile: MpdProfile) => {
      if (!mpdProfileState.profiles.includes(mpdProfile)) {
        throw Error(
          `Invalid profile state: ${mpdProfile.toJsonString()} is not in profiles`,
        );
      }
      const newMpdProfileState = mpdProfileState.clone();
      newMpdProfileState.currentProfile = mpdProfile;
      await sendMpdProfileState(newMpdProfileState);
      refresh();
    },
    [mpdProfileState, refresh],
  );
}
