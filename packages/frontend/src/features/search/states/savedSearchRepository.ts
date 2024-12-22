import { atomWithDefault } from "jotai/utils";

import { SavedSearchRepository } from "../services/SavedSearchRepository";

export const savedSearchRepositoryAtom = atomWithDefault<SavedSearchRepository>(
  () => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  },
);
