import { useAtomValue } from "jotai";

import { mpdProfileStateAtom } from "../atoms/profile";

export function useMpdProfileState() {
  return useAtomValue(mpdProfileStateAtom);
}
