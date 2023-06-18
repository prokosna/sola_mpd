import { produce } from "immer";
import { useCallback } from "react";

import { useResizablePaneWidth } from "../../global/hooks/useResizablePaneWidth";
import { useAppStore } from "../../global/store/AppStore";

export function usePlaylistResizablePane() {
  const layoutState = useAppStore((state) => state.layoutState);
  const pushLayoutState = useAppStore((state) => state.pushLayoutState);

  const onWidthChanged = useCallback(
    async (leftPaneWidth: number) => {
      if (layoutState?.playlistLayout === undefined) {
        return;
      }
      const newLayoutState = produce(layoutState, (draft) => {
        draft.playlistLayout!.sidePaneWidth = leftPaneWidth;
      });
      pushLayoutState(newLayoutState);
    },
    [layoutState, pushLayoutState]
  );

  const resizablePaneWidth = useResizablePaneWidth({
    leftPaneWidth: layoutState?.playlistLayout?.sidePaneWidth,
    onWidthChanged,
  });

  return resizablePaneWidth;
}
