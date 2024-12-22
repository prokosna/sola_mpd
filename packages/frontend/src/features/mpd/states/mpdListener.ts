import { useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { MpdListener } from "../services/MpdListener";

export const mpdListenerAtom = atomWithDefault<MpdListener>(() => {
  throw new Error("Not initialized");
});

/**
 * useMpdListenerState returns the current MpdListener instance.
 * It throws an error if the atom is not initialized.
 */
export function useMpdListenerState() {
  return useAtomValue(mpdListenerAtom);
}
