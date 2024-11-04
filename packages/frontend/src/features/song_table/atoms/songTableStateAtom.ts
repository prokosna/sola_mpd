import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

export const songTableStateAtom = atomWithDefault(async (get) => {
  const repository = get(songTableStateRepositoryAtom);
  const songTableState = await repository.get();
  return songTableState;
});

export const songTableStateSyncAtom = atomWithSync(songTableStateAtom);

export const updateSongTableStateAtom = atom(
  null,
  async (get, set, newState: SongTableState) => {
    const repository = get(songTableStateRepositoryAtom);
    await repository.update(newState);
    set(songTableStateAtom, Promise.resolve(newState));
  },
);
