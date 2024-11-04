import { atomWithDefault } from "jotai/utils";

import { MpdClient } from "../services/MpdClient";

export const mpdClientAtom = atomWithDefault<MpdClient>(() => {
  throw new Error("Not initialized");
});
