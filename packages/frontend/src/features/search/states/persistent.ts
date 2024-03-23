import { Search } from "@sola_mpd/domain/src/models/search_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { fetchSavedSearches, sendSavedSearches } from "../helpers/api";

const savedSearchesAtom = atomWithRefresh(async (_get) => {
  return await fetchSavedSearches();
});

const unwrappedSavedSearchesAtom = unwrap(
  savedSearchesAtom,
  (prev) => prev || undefined,
);

export { savedSearchesAtom };

export function useSavedSearchesState() {
  return useAtomValue(unwrappedSavedSearchesAtom);
}

export function useRefreshSavedSearchesState() {
  return useSetAtom(savedSearchesAtom);
}

export function useSetSavedSearchesState() {
  const refresh = useSetAtom(savedSearchesAtom);

  return useCallback(
    async (searches: Search[]) => {
      await sendSavedSearches(searches);
      refresh();
    },
    [refresh],
  );
}
