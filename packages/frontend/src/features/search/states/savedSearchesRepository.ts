import { atomWithDefault } from "jotai/utils";

import { SavedSearchesRepository } from "../services/SavedSearchesRepository";

/**
 * Atom for saved searches repository.
 *
 * Must be initialized by DI provider.
 */
export const savedSearchesRepositoryAtom =
  atomWithDefault<SavedSearchesRepository>(() => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  });
