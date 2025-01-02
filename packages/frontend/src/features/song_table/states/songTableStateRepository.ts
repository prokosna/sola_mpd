import { atomWithDefault } from "jotai/utils";

import { SongTableStateRepository } from "../services/SongTableStateRepository";

/**
 * Global state atom for song table state repository.
 *
 * Manages dependency injection of the repository implementation.
 * Throws error if accessed before initialization in provider.
 */
export const songTableStateRepositoryAtom =
  atomWithDefault<SongTableStateRepository>(() => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  });
