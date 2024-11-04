import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

export const songTableStateAtom = atomWithDefault(async (get) => {
  const repository = get(songTableStateRepositoryAtom);
  const songTableState = await repository.get();
  return songTableState;
});

export const songTableStateSyncAtom = atomWithSync(songTableStateAtom);
