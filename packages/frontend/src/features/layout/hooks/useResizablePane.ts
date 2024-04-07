import { setSashSize } from "allotment";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useIsTouchDevice } from "../../user_device";

export function useResizablePane(
  leftWidth: number | undefined,
  onChangeWidth: (left: number) => Promise<void>,
) {
  const isTouchDevice = useIsTouchDevice();

  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const leftPaneWidth = useMemo(
    () => (leftWidth !== undefined ? `${leftWidth}px` : undefined),
    [leftWidth],
  );

  const rightPaneWidth = useMemo(
    () => (leftWidth !== undefined ? `calc(100% - ${leftWidth}px)` : undefined),
    [leftWidth],
  );

  useEffect(() => {
    if (isTouchDevice) {
      setSashSize(40);
    }
  }, [isTouchDevice]);

  const onChange = useCallback(
    (left: number, _right: number) => {
      if (leftWidth === undefined) {
        return;
      }
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      timeoutId.current = setTimeout(() => {
        onChangeWidth(left);
      }, 100);
    },
    [leftWidth, onChangeWidth],
  );

  return {
    isReady: leftPaneWidth !== undefined && rightPaneWidth !== undefined,
    leftPaneWidth,
    rightPaneWidth,
    onChange,
  };
}
