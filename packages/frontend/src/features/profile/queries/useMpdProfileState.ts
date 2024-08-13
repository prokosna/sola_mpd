import { useAtomValue } from "jotai";

import { mpdProfileStateAtom } from "../atoms/profile";

export function useMpdProfileState() {
  const mpdProfileState = useAtomValue(mpdProfileStateAtom);
  return mpdProfileState;
}
