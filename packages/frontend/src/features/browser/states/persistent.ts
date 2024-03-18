import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { fetchBrowserState, sendBrowserState } from "../helpers/api";

const browserStateAtom = atomWithRefresh(async (_get) => {
  return await fetchBrowserState();
});

const unwrappedBrowserStateAtom = unwrap(
  browserStateAtom,
  (prev) => prev || undefined,
);

export { browserStateAtom };

export function useBrowserState() {
  return useAtomValue(unwrappedBrowserStateAtom);
}

export function useUpdateBrowserState() {
  const refresh = useSetAtom(browserStateAtom);

  return useCallback(
    async (browserState: BrowserState) => {
      await sendBrowserState(browserState);
      refresh();
    },
    [refresh],
  );
}
