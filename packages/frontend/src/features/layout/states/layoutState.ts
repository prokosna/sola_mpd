import {
  BrowserLayout,
  FileExploreLayout,
  LayoutState,
  PlaylistLayout,
  SearchLayout,
} from "@sola_mpd/domain/src/models/layout_pb.js";
import { useAtomValue } from "jotai";
import { atomWithDefault, selectAtom, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";

import { layoutStateRepositoryAtom } from "./layoutStateRepositry";

const layoutStateAtom = atomWithDefault(async (get) => {
  const repository = get(layoutStateRepositoryAtom);
  const layoutState = await repository.fetch();
  return layoutState;
});
const layoutStateSyncAtom = atomWithSync(layoutStateAtom);

const fileExploreLayoutStateSyncAtom = selectAtom(
  layoutStateSyncAtom,
  (layoutState: LayoutState) => layoutState.fileExploreLayout!,
);
const playlistLayoutStateSyncAtom = selectAtom(
  layoutStateSyncAtom,
  (layoutState: LayoutState) => layoutState.playlistLayout!,
);
const searchLayoutStateSyncAtom = selectAtom(
  layoutStateSyncAtom,
  (layoutState: LayoutState) => layoutState.searchLayout!,
);
const browserLayoutStateSyncAtom = selectAtom(
  layoutStateSyncAtom,
  (layoutState: LayoutState) => layoutState.browserLayout!,
);

/**
 * Returns the current layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current layout state.
 */
export function useLayoutState(): LayoutState {
  return useAtomValue(layoutStateSyncAtom);
}

/**
 * Returns the current file explore layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current file explore layout state.
 */
export function useFileExploreLayoutState(): FileExploreLayout {
  return useAtomValue(fileExploreLayoutStateSyncAtom);
}

/**
 * Returns the current playlist layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current playlist layout state.
 */
export function usePlaylistLayoutState(): PlaylistLayout {
  return useAtomValue(playlistLayoutStateSyncAtom);
}

/**
 * Returns the current search layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current search layout state.
 */
export function useSearchLayoutState(): SearchLayout {
  return useAtomValue(searchLayoutStateSyncAtom);
}

/**
 * Returns the current browser layout state.
 *
 * The state is automatically updated if the stored state changes.
 * @returns The current browser layout state.
 */
export function useBrowserLayoutState(): BrowserLayout {
  return useAtomValue(browserLayoutStateSyncAtom);
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

/**
 * Returns a function to call to save a state.
 *
 * The state is automatically persisted.
 * @returns Function to call to save a state.
 */
export function useSaveLayoutState(): (
  layout: FileExploreLayout | SearchLayout | BrowserLayout | PlaylistLayout,
) => void {
  const layoutState = useAtomValue(layoutStateSyncAtom);
  const repository = useAtomValue(layoutStateRepositoryAtom);

  return useCallback(
    async (
      layout: FileExploreLayout | SearchLayout | BrowserLayout | PlaylistLayout,
    ): Promise<void> => {
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
      await repository.save(newLayoutState);
    },
    [layoutState, repository],
  );
}
