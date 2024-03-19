import { produce } from "immer";
import { useCallback, useEffect } from "react";

import { useResizablePaneWidth } from "../../global/hooks/useResizablePaneWidth";
import { useAppStore } from "../../global/store/AppStore";

export function useBrowserResizablePane() {
  const layoutState = useAppStore((state) => state.layoutState);
  const pullBrowserFilters = useAppStore((state) => state.pullBrowserFilters);
  const pushLayoutState = useAppStore((state) => state.pushLayoutState);

  // Initial loading
  useEffect(() => {
    pullBrowserFilters();
  }, [pullBrowserFilters]);

  const onWidthChanged = useCallback(
    async (leftPaneWidth: number) => {
      if (layoutState?.browserLayout === undefined) {
        return;
      }
      const newLayoutState = produce(layoutState, (draft) => {
        draft.browserLayout!.sidePaneWidth = leftPaneWidth;
      });
      pushLayoutState(newLayoutState);
    },
    [layoutState, pushLayoutState],
  );

  const resizablePaneWidth = useResizablePaneWidth({
    leftPaneWidth: layoutState?.browserLayout?.sidePaneWidth,
    onWidthChanged,
  });

  return resizablePaneWidth;
}
