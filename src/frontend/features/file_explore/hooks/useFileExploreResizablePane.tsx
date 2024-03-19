import { produce } from "immer";
import { useCallback } from "react";

import { useResizablePaneWidth } from "../../global/hooks/useResizablePaneWidth";
import { useAppStore } from "../../global/store/AppStore";

export function useFileExploreResizablePane() {
  const layoutState = useAppStore((state) => state.layoutState);
  const pushLayoutState = useAppStore((state) => state.pushLayoutState);

  const onWidthChanged = useCallback(
    async (leftPaneWidth: number) => {
      if (layoutState?.fileExploreLayout === undefined) {
        return;
      }
      const newLayoutState = produce(layoutState, (draft) => {
        draft.fileExploreLayout!.sidePaneWidth = leftPaneWidth;
      });
      pushLayoutState(newLayoutState);
    },
    [layoutState, pushLayoutState],
  );

  const resizablePaneWidth = useResizablePaneWidth({
    leftPaneWidth: layoutState?.fileExploreLayout?.sidePaneWidth,
    onWidthChanged,
  });

  return resizablePaneWidth;
}
