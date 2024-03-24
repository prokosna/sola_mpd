import { useCallback, useRef } from "react";

import { useSetGlobalFilterTextState } from "../states/filter";

export function useFilterTextActionsWithDebounce() {
  const setGlobalFilterText = useSetGlobalFilterTextState();

  const lastInvocation = useRef<ReturnType<typeof setTimeout>>();

  const onTextChanged = useCallback(
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

  return {
    onTextChanged,
  };
}
