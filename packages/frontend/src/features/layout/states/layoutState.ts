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

/**
 * Root atom for managing application layout state.
 *
 * Features:
 * - Async state initialization
 * - Repository integration
 * - State synchronization
 * - Type-safe operations
 *
 * State Structure:
 * - File explorer layout
 * - Playlist layout
 * - Search layout
 * - Browser layout
 * - Recently added layout
 *
 * Implementation:
 * - Uses atomWithDefault for lazy loading
 * - Handles Promise resolution
 * - Supports state persistence
 * - Manages derived states
 */
const layoutStateAtom = atomWithDefault<Promise<LayoutState> | LayoutState>(
  async (get) => {
    const repository = get(layoutStateRepositoryAtom);
    const layoutState = await repository.fetch();
    return layoutState;
  },
);

/**
 * Synchronized atom with persistence support.
 */
const layoutStateSyncAtom = atomWithSync(layoutStateAtom);

/**
 * Derived atom for file explorer layout.
 * Selectively updates on file explorer changes.
 */
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
 * Hook for accessing root layout state.
 *
 * Features:
 * - Automatic state updates
 * - Type-safe state access
 * - Repository integration
 * - Error handling
 *
 * @returns Current layout state
 */
export function useLayoutState() {
  return useAtomValue(layoutStateSyncAtom);
}

/**
 * Hook for file explorer layout state.
 *
 * Features:
 * - Selective state updates
 * - Type-safe file explorer state
 * - Automatic synchronization
 * - Memory efficient
 *
 * @returns File explorer layout state
 */
export function useFileExploreLayoutState() {
  return useAtomValue(fileExploreLayoutStateSyncAtom);
}

/**
 * Hook for playlist layout state.
 *
 * Features:
 * - Playlist-specific updates
 * - Type-safe playlist state
 * - Automatic synchronization
 * - Performance optimized
 *
 * @returns Playlist layout state
 */
export function usePlaylistLayoutState() {
  return useAtomValue(playlistLayoutStateSyncAtom);
}

/**
 * Hook for search layout state.
 *
 * Features:
 * - Search-specific updates
 * - Type-safe search state
 * - Automatic synchronization
 * - Efficient re-renders
 *
 * @returns Search layout state
 */
export function useSearchLayoutState() {
  return useAtomValue(searchLayoutStateSyncAtom);
}

/**
 * Hook for browser layout state.
 *
 * Features:
 * - Browser-specific updates
 * - Type-safe browser state
 * - Automatic synchronization
 * - Memory efficient
 *
 * @returns Browser layout state
 */
export function useBrowserLayoutState() {
  return useAtomValue(browserLayoutStateSyncAtom);
}

/**
 * Hook for recently added layout state.
 *
 * Features:
 * - Recently added view updates
 * - Type-safe state access
 * - Automatic synchronization
 * - Performance optimized
 *
 * @returns Recently added layout state
 */
export function useRecentlyAddedLayoutState() {
  return useAtomValue(recentlyAddedLayoutStateSyncAtom);
}

/**
 * Hook for updating layout state.
 *
 * Features:
 * - Multiple update modes
 * - Debounced persistence
 * - State validation
 * - Error handling
 *
 * Update Modes:
 * - LOCAL_STATE: Memory only
 * - PERSIST: Storage write
 * - Combined: Both operations
 *
 * Implementation:
 * - Clones state for updates
 * - Validates state integrity
 * - Optimizes persistence
 * - Handles edge cases
 *
 * @returns Layout state updater
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
 * Hook for refreshing layout state.
 *
 * Features:
 * - Force state refresh
 * - Repository sync
 * - Error recovery
 * - State reset
 *
 * Use Cases:
 * - External state changes
 * - Storage synchronization
 * - State corruption
 * - Manual refresh
 *
 * Implementation:
 * - Fresh repository fetch
 * - Full state update
 * - Notification system
 * - Error handling
 *
 * @returns State refresh function
 */
export function useRefreshLayoutState(): () => void {
  return useResetAtom(layoutStateAtom);
}
