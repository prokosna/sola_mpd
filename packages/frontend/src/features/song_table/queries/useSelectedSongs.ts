import { useAtomValue } from "jotai";

import { selectedSongsAtom } from "../atoms/selectedSongs";

export function useSelectedSongs() {
  return useAtomValue(selectedSongsAtom);
}
