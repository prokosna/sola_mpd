import { useCallback, useRef } from "react";

import { useSetGlobalFilterTextState } from "../states/globalFilterState";

/**
 * A custom hook that provides a debounced function for handling global filter text changes.
 * It delays the execution of the text change operation to reduce the frequency of updates,
 * which can be useful for performance optimization in scenarios like real-time filtering.
 *
 * @returns An object containing the debounced text change handler function.
 */
export function useHandleGlobalFilterTextChangeWithDebounce() {
  const setGlobalFilterText = useSetGlobalFilterTextState();

  const lastInvocation = useRef<ReturnType<typeof setTimeout>>();

  const handleTextChange = useCallback(
    (text: string) => {
      if (lastInvocation.current !== undefined) {
        clearTimeout(lastInvocation.current);
      }
      const timeoutId = setTimeout(() => {
        setGlobalFilterText(text);
      }, 500);
      lastInvocation.current = timeoutId;
    },
    [setGlobalFilterText],
  );

  return handleTextChange;
}
