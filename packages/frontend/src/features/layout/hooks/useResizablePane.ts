import { setSashSize } from "allotment";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIsTouchDevice } from "../../user_device";

/**
 * Advanced resizable pane management hook with persistence.
 *
 * Features:
 * - Touch device optimization
 * - Debounced persistence
 * - Width constraints
 * - Percentage-based sizing
 * - Responsive layout
 *
 * Implementation:
 * - Uses allotment for split panes
 * - Ref-based timeout tracking
 * - Memoized width calculations
 * - Device-aware adjustments
 *
 * Performance:
 * - Debounced state updates
 * - Optimized resize handling
 * - Minimal re-renders
 * - Memory-safe cleanup
 *
 * Safety Features:
 * - NaN value protection
 * - Width constraints (max 90%)
 * - Timeout cleanup
 * - Undefined state handling
 *
 * @example
 * ```tsx
 * const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
 *   50, // Initial left pane width (50%)
 *   async (width) => await saveWidth(width)
 * );
 * ```
 *
 * @param leftWidth Initial left pane width (%)
 * @param onPanelWidthUpdated Width change callback
 * @returns Hook state and handlers
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
