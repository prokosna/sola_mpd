import { useAtomValue } from "jotai";

import { commonSongTableStateSyncAtom } from "../atoms/commonSongTableState";

export function useCommonSongTableState() {
  return useAtomValue(commonSongTableStateSyncAtom);
}
