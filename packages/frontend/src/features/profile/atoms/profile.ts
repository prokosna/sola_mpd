import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { MpdProfileStateRepository } from "../services/MpdProfileStateRepository";
import { changeCurrentMpdProfile } from "../workflows/changeCurrentMpdProfile";

// Services
export const mpdProfileStateRepositoryAtom =
  atomWithDefault<MpdProfileStateRepository>(() => {
    throw new Error("Not initialized");
  });

// Read atoms
export const mpdProfileStateAtom = atomWithDefault(async (get) => {
  const repository = get(mpdProfileStateRepositoryAtom);
  const mpdProfileState = await repository.get();
  return mpdProfileState;
});

export const currentMpdProfileAtom = atom(async (get) => {
  const mpdProfileState = await get(mpdProfileStateAtom);
  return mpdProfileState.currentProfile;
});

// Write atoms
export const publishMpdProfileStateChangedEventAtom = atom(
  null,
  async (get, set, newMpdProfileState: MpdProfileState) => {
    const repository = get(mpdProfileStateRepositoryAtom);
    await repository.update(newMpdProfileState);
    set(mpdProfileStateAtom, Promise.resolve(newMpdProfileState));
  },
);

export const publishCurrentMpdProfileChangedEventAtom = atom(
  null,
  async (get, set, newCurrentMpdProfile: MpdProfile) => {
    const repository = get(mpdProfileStateRepositoryAtom);
    const mpdProfileState = await get(mpdProfileStateAtom);
    const newMpdProfileState = changeCurrentMpdProfile(
      newCurrentMpdProfile,
      mpdProfileState,
    );
    await repository.update(newMpdProfileState);
    set(mpdProfileStateAtom, Promise.resolve(newMpdProfileState));
  },
);
