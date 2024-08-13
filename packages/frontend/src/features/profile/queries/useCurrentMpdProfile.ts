import { useAtomValue } from "jotai";

import { currentMpdProfileAtom } from "../atoms/profile";

export function useCurrentMpdProfile() {
  const currentMpdProfile = useAtomValue(currentMpdProfileAtom);
  return currentMpdProfile;
}
