import { useAtomValue } from "jotai";

import { commonSongTableStateAtom } from "../atoms/commonSongTableState";

export function useCommonSongTableState() {
  return useAtomValue(commonSongTableStateAtom);
}
