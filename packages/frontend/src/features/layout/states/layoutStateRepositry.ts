import { atomWithDefault } from "jotai/utils";

import { LayoutStateRepository } from "../services/LayoutStateRepository";

export const layoutStateRepositoryAtom = atomWithDefault<LayoutStateRepository>(
  () => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  },
);
