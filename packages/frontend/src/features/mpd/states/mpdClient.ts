import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { MpdClient } from "../services/MpdClient";

export const mpdClientAtom = atomWithDefault<MpdClient>(() => {
  throw new Error("Not initialized. Should be setup DI in the provider.");
});

/**
 * useMpdClientState returns the current MpdClient instance.
 * It throws an error if the atom is not initialized.
 */
export function useMpdClientState() {
  return useAtomValue(mpdClientAtom);
}
