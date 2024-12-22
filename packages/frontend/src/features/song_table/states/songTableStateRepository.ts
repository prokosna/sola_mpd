import { atomWithDefault } from "jotai/utils";

import { SongTableStateRepository } from "../services/SongTableStateRepository";

export const songTableStateRepositoryAtom =
  atomWithDefault<SongTableStateRepository>(() => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  });
