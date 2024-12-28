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
    () => (leftWidth !== undefined ? `${Math.min(90, leftWidth)}%` : undefined),
    [leftWidth],
  );

  useEffect(() => {
    if (isTouchDevice) {
      setSashSize(40);
    }
  }, [isTouchDevice]);

  const handlePanelResize = useCallback(
    (left: number, right: number) => {
      if (isNaN(left) || isNaN(right)) {
        return;
      }
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      const leftPercentage = (left / (left + right)) * 100;
      timeoutId.current = setTimeout(() => {
        onPanelWidthUpdated(leftPercentage);
      }, 100);
    },
    [onPanelWidthUpdated],
  );

  return {
    isReady: leftPaneWidthStyle !== undefined,
    leftPaneWidthStyle,
    handlePanelResize,
  };
}
