import {
  BrowserLayout,
  FileExploreLayout,
  LayoutState,
  PlaylistLayout,
  SearchLayout,
} from "@sola_mpd/domain/src/models/layout_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithDefault, useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { UpdateMode } from "../../../types/stateTypes";

import { layoutStateRepositoryAtom } from "./layoutStateRepositry";

const layoutStateAtom = atomWithDefault(async (get) => {
  const repository = get(layoutStateRepositoryAtom);
  const layoutState = await repository.fetch();
  return layoutState;
});
const layoutStateSyncAtom = atomWithSync(layoutStateAtom);

const fileExploreLayoutStateSyncAtom = atom(async (get) => {
  const layoutState = await get(layoutStateSyncAtom);
  return layoutState.fileExploreLayout!;
});

const playlistLayoutStateSyncAtom = atom(async (get) => {
  const layoutState = await get(layoutStateSyncAtom);
  return layoutState.playlistLayout!;
});

const searchLayoutStateSyncAtom = atom(async (get) => {
  const layoutState = await get(layoutStateSyncAtom);
  return layoutState.searchLayout!;
});

const browserLayoutStateSyncAtom = atom(async (get) => {
  const layoutState = await get(layoutStateSyncAtom);
  return layoutState.browserLayout!;
});

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
      }

      if (mode & UpdateMode.LOCAL_STATE) {
        setLayoutState(Promise.resolve(newLayoutState));
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