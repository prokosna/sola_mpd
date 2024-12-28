import { atomWithDefault } from "jotai/utils";

import { SavedSearchesRepository } from "../services/SavedSearchesRepository";

export const savedSearchesRepositoryAtom =
  atomWithDefault<SavedSearchesRepository>(() => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  });
