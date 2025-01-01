import {
  BrowserLayout,
  FileExploreLayout,
  LayoutState,
  PlaylistLayout,
  RecentlyAddedLayout,
  SearchLayout,
} from "@sola_mpd/domain/src/models/layout_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, selectAtom, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { layoutStateRepositoryAtom } from "./layoutStateRepositry";

const layoutStateAtom = atomWithDefault<Promise<LayoutState> | LayoutState>(
  async (get) => {
    const repository = get(layoutStateRepositoryAtom);
    const layoutState = await repository.fetch();
    return layoutState;
  },
);
const layoutStateSyncAtom = atomWithSync(layoutStateAtom);

const fileExploreLayoutStateSyncAtom = selectAtom<
  LayoutState | undefined,
  FileExploreLayout | undefined
>(
  layoutStateSyncAtom,
  (state, _prev) => state?.fileExploreLayout,
  (a, b) => a?.equals(b) ?? false,
);

const playlistLayoutStateSyncAtom = selectAtom<
  LayoutState | undefined,
  PlaylistLayout | undefined
>(
  layoutStateSyncAtom,
  (state, _prev) => state?.playlistLayout,
  (a, b) => a?.equals(b) ?? false,
);

const searchLayoutStateSyncAtom = selectAtom<
  LayoutState | undefined,
  SearchLayout | undefined
>(
  layoutStateSyncAtom,
  (state, _prev) => state?.searchLayout,
  (a, b) => a?.equals(b) ?? false,
);

const browserLayoutStateSyncAtom = selectAtom<
  LayoutState | undefined,
  BrowserLayout | undefined
>(
  layoutStateSyncAtom,
  (state, _prev) => state?.browserLayout,
  (a, b) => a?.equals(b) ?? false,
);

const recentlyAddedLayoutStateSyncAtom = selectAtom<
  LayoutState | undefined,
  RecentlyAddedLayout | undefined
>(
  layoutStateSyncAtom,
  (state, _prev) => state?.recentlyAddedLayout,
  (a, b) => a?.equals(b) ?? false,
);

/**
 * Returns the current layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current layout state.
 */
export function useLayoutState() {
  return useAtomValue(layoutStateSyncAtom);
}

/**
 * Returns the current file explore layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current file explore layout state.
 */
export function useFileExploreLayoutState() {
  return useAtomValue(fileExploreLayoutStateSyncAtom);
}

/**
 * Returns the current playlist layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current playlist layout state.
 */
export function usePlaylistLayoutState() {
  return useAtomValue(playlistLayoutStateSyncAtom);
}

/**
 * Returns the current search layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current search layout state.
 */
export function useSearchLayoutState() {
  return useAtomValue(searchLayoutStateSyncAtom);
}

/**
 * Returns the current browser layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current browser layout state.
 */
export function useBrowserLayoutState() {
  return useAtomValue(browserLayoutStateSyncAtom);
}

/**
 * Returns the current recently added layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current recently added layout state.
 */
export function useRecentlyAddedLayoutState() {
  return useAtomValue(recentlyAddedLayoutStateSyncAtom);
}

/**
 * Returns a function to update layout state.
 *
 * The state is automatically updated and persisted with 1 second debounce.
 * @returns Function to call to update a state.
 */
export function useUpdateLayoutState() {
  const layoutState = useAtomValue(layoutStateAtom);
  const repository = useAtomValue(layoutStateRepositoryAtom);
  const setLayoutState = useSetAtom(layoutStateAtom);

  return useCallback(
    async (
      layout:
        | FileExploreLayout
        | SearchLayout
        | BrowserLayout
        | PlaylistLayout
        | RecentlyAddedLayout
        | LayoutState,
      mode: UpdateMode,
    ): Promise<void> => {
      const newLayoutState =
        layout instanceof LayoutState ? layout : layoutState.clone();
      if (layout instanceof FileExploreLayout) {
        newLayoutState.fileExploreLayout = layout;
      } else if (layout instanceof SearchLayout) {
        newLayoutState.searchLayout = layout;
      } else if (layout instanceof BrowserLayout) {
        newLayoutState.browserLayout = layout;
      } else if (layout instanceof PlaylistLayout) {
        newLayoutState.playlistLayout = layout;
      } else if (layout instanceof RecentlyAddedLayout) {
        newLayoutState.recentlyAddedLayout = layout;
      }

      if (mode & UpdateMode.LOCAL_STATE) {
        setLayoutState(newLayoutState);
      }
      if (mode & UpdateMode.PERSIST) {
        await repository.save(newLayoutState);
      }
    },
    [layoutState, repository, setLayoutState],
  );
}

/**
 * Returns a function to call to refresh a state.
 *
 * The state is automatically persisted.
 * @returns A function to refresh the layout state.
 */
export function useRefreshLayoutState(): () => void {
  return useResetAtom(layoutStateAtom);
}
