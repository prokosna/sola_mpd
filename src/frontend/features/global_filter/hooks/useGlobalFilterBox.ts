import { useCallback, useRef } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function useGlobalFilterBox() {
  const updateGlobalSearchText = useAppStore(
    (state) => state.updateGlobalFilterText
  );

  const lastInvocation = useRef<ReturnType<typeof setTimeout>>();

  const onTextChanged = useCallback(
    (v: string) => {
      if (lastInvocation.current !== undefined) {
        clearTimeout(lastInvocation.current);
      }
      const timeoutId = setTimeout(() => {
        updateGlobalSearchText(v);
      }, 1000);
      lastInvocation.current = timeoutId;
    },
    [updateGlobalSearchText]
  );

  const onTextCleared = useCallback(() => {
    updateGlobalSearchText("");
  }, [updateGlobalSearchText]);

  return {
    onTextChanged,
    onTextCleared,
  };
}
