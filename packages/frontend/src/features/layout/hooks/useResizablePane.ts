import { setSashSize } from "allotment";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIsTouchDevice } from "../../user_device";

/**
 * A custom hook for managing resizable panes.
 *
 * @param leftWidth - The initial width of the left pane.
 * @param onPanelWidthUpdated - A function to update the panel width asynchronously.
 * @returns An object containing the current state and handlers for the resizable pane.
 */
export function useResizablePane(
  leftWidth: number | undefined,
  onPanelWidthUpdated: (left: number) => Promise<void>,
) {
  const isTouchDevice = useIsTouchDevice();

  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const leftPaneWidthStyle = useMemo(
    () => (leftWidth !== undefined ? `${leftWidth}px` : undefined),
    [leftWidth],
  );

  const rightPaneWidthStyle = useMemo(
    () => (leftWidth !== undefined ? `calc(100% - ${leftWidth}px)` : undefined),
    [leftWidth],
  );

  useEffect(() => {
    if (isTouchDevice) {
      setSashSize(40);
    }
  }, [isTouchDevice]);

  const handlePanelResize = useCallback(
    (left: number, _right: number) => {
      if (leftWidth === undefined) {
        return;
      }
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      timeoutId.current = setTimeout(() => {
        onPanelWidthUpdated(left);
      }, 100);
    },
    [leftWidth, onPanelWidthUpdated],
  );

  return {
    isReady:
      leftPaneWidthStyle !== undefined && rightPaneWidthStyle !== undefined,
    leftPaneWidthStyle,
    rightPaneWidthStyle,
    handlePanelResize,
  };
}
