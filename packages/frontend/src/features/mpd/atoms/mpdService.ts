import { atomWithDefault } from "jotai/utils";

import { MpdService } from "../services/MpdService";

export const mpdServiceAtom = atomWithDefault<MpdService>(() => {
  throw new Error("Not initialized");
});
