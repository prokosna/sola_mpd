import { useAtomValue } from "jotai";

import { currentMpdProfileAtom } from "../atoms/profile";

export function useCurrentMpdProfile() {
  return useAtomValue(currentMpdProfileAtom);
}
