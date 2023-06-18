import { useCallback, useMemo, useRef } from "react";

export function useResizablePaneWidth(props: {
  leftPaneWidth: number | undefined;
  onWidthChanged: (leftPaneWidth: number) => Promise<void>;
}) {
  const { leftPaneWidth, onWidthChanged } = props;

  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const leftPaneWidthStr = useMemo(
    () => (leftPaneWidth !== undefined ? `${leftPaneWidth}px` : undefined),
    [leftPaneWidth]
  );

  const rightPaneWidthStr = useMemo(
    () =>
      leftPaneWidth !== undefined
        ? `calc(100% - ${leftPaneWidth}px)`
        : undefined,
    [leftPaneWidth]
  );

  const onPaneWidthChanged = useCallback(
    (leftSize: number, rightSize: number) => {
      if (leftPaneWidth === undefined) {
        return;
      }
      if (timeoutId.current !== undefined) {
        clearTimeout(timeoutId.current);
        timeoutId.current = undefined;
      }
      timeoutId.current = setTimeout(() => {
        onWidthChanged(leftSize);
      }, 1000);
    },
    [leftPaneWidth, onWidthChanged]
  );

  return {
    isLoading:
      leftPaneWidthStr === undefined || rightPaneWidthStr === undefined,
    leftPaneWidthStr,
    rightPaneWidthStr,
    onPaneWidthChanged,
  };
}
