import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { CommonSongTableStateRepository } from "../services/CommonSongTableStateRepository";

// Services
export const commonSongTableStateRepositoryAtom =
  atomWithDefault<CommonSongTableStateRepository>(() => {
    throw new Error("Not initialized");
  });

// Read atoms
export const commonSongTableStateAtom = atomWithDefault(async (get) => {
  const repository = get(commonSongTableStateRepositoryAtom);
  const commonSongTableState = await repository.get();
  return commonSongTableState;
});
export const commonSongTableStateSyncAtom = atomWithSync(
  commonSongTableStateAtom,
);

// Write atoms
export const publishCommonSongTableStateChangedEventAtom = atom(
  null,
  async (get, set, newCommonSongTableState: SongTableState) => {
    const repository = get(commonSongTableStateRepositoryAtom);
    await repository.update(newCommonSongTableState);
    set(commonSongTableStateAtom, Promise.resolve(newCommonSongTableState));
  },
);
