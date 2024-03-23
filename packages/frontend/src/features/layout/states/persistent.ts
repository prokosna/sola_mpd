import {
  BrowserLayout,
  FileExploreLayout,
  LayoutState,
  PlaylistLayout,
  SearchLayout,
} from "@sola_mpd/domain/src/models/layout_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import { useCallback } from "react";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { fetchLayoutState, sendLayoutState } from "../helpers/api";

const layoutStateAtom = atomWithRefresh(async (_get) => {
  return await fetchLayoutState();
});

const unwrappedLayoutStateAtom = unwrap(
  layoutStateAtom,
  (prev) => prev || undefined,
);

const unwrappedFileExploreLayoutAtom = unwrap(
  atom(async (get) => {
    const layoutState = await get(layoutStateAtom);
    return layoutState.fileExploreLayout;
  }),
  (prev) => prev || undefined,
);

const unwrappedSearchLayoutAtom = unwrap(
  atom(async (get) => {
    const layoutState = await get(layoutStateAtom);
    return layoutState.searchLayout;
  }),
  (prev) => prev || undefined,
);

const unwrappedBrowserLayoutAtom = unwrap(
  atom(async (get) => {
    const layoutState = await get(layoutStateAtom);
    return layoutState.browserLayout;
  }),
  (prev) => prev || undefined,
);

const unwrappedPlaylistLayoutAtom = unwrap(
  atom(async (get) => {
    const layoutState = await get(layoutStateAtom);
    return layoutState.playlistLayout;
  }),
  (prev) => prev || undefined,
);

export function useLayoutState() {
  return useAtomValue(unwrappedLayoutStateAtom);
}

export function useRefreshLayoutState() {
  return useSetAtom(layoutStateAtom);
}

export function useSetLayoutState() {
  const refresh = useSetAtom(layoutStateAtom);

  return useCallback(
    async (layoutState: LayoutState) => {
      await sendLayoutState(layoutState);
      refresh();
    },
    [refresh],
  );
}

export function useFileExploreLayoutState() {
  return useAtomValue(unwrappedFileExploreLayoutAtom);
}

export function useSearchLayoutState() {
  return useAtomValue(unwrappedSearchLayoutAtom);
}

export function useBrowserLayoutState() {
  return useAtomValue(unwrappedBrowserLayoutAtom);
}

export function usePlaylistLayoutState() {
  return useAtomValue(unwrappedPlaylistLayoutAtom);
}

export function useSaveLayoutState() {
  const layoutState = useAtomValue(layoutStateAtom);

  return useCallback(
    (
      layout: FileExploreLayout | SearchLayout | BrowserLayout | PlaylistLayout,
    ) => {
      const newLayoutState = layoutState.clone();
      if (layout instanceof FileExploreLayout) {
        newLayoutState.fileExploreLayout = layout;
      } else if (layout instanceof SearchLayout) {
        newLayoutState.searchLayout = layout;
      } else if (layout instanceof BrowserLayout) {
        newLayoutState.browserLayout = layout;
      } else if (layout instanceof PlaylistLayout) {
        newLayoutState.playlistLayout = layout;
      }
      sendLayoutState(newLayoutState);
    },
    [layoutState],
  );
}
