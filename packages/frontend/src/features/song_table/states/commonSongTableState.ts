import { CommonSongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import {
  fetchCommonSongTableState,
  sendCommonSongTableState,
} from "../helpers/api";

const commonSongTableStateAtom = atomWithRefresh(async (_get) => {
  return await fetchCommonSongTableState();
});

const unwrappedCommonSongTableStateAtom = unwrap(
  commonSongTableStateAtom,
  (prev) => prev || undefined,
);

export { commonSongTableStateAtom };

export function useCommonSongTableState() {
  return useAtomValue(unwrappedCommonSongTableStateAtom);
}

export function useSetCommonSongTableState() {
  const refresh = useSetAtom(commonSongTableStateAtom);

  return useCallback(
    async (commonSongTableState: CommonSongTableState) => {
      await sendCommonSongTableState(commonSongTableState);
      refresh();
    },
    [refresh],
  );
}

export function useSaveCommonSongTableState() {
  return useCallback(async (commonSongTableState: CommonSongTableState) => {
    await sendCommonSongTableState(commonSongTableState);
  }, []);
}
