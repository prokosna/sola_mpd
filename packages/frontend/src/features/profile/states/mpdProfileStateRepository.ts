import { atomWithDefault } from "jotai/utils";

import { MpdProfileStateRepository } from "../services/MpdProfileStateRepository";

export const mpdProfileStateRepositoryAtom =
  atomWithDefault<MpdProfileStateRepository>(() => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  });
