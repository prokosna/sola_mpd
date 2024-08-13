import { atomWithDefault } from "jotai/utils";

import { MpdService } from "../MpdService";

export const mpdServiceAtom = atomWithDefault<MpdService>(() => {
  throw new Error("Not initialized");
});
