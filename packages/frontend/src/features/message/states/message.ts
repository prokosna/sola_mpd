import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { getAppMessageDuration } from "../helpers/message";
import { AppMessage } from "../types/message";

const appMessageAtom = atom<AppMessage | undefined>(undefined);

const appMessageTimeoutIdAtom = atom<ReturnType<typeof setTimeout> | undefined>(
  undefined,
);

export function useAppMessageState() {
  return useAtomValue(appMessageAtom);
}

export function useSetAppMessageState() {
  const setAppMessage = useSetAtom(appMessageAtom);
  const [appMessageTimeoutId, setAppMessageTimeoutId] = useAtom(
    appMessageTimeoutIdAtom,
  );

  return useCallback(
    (appMessage: AppMessage) => {
      if (appMessageTimeoutId !== undefined) {
        clearTimeout(appMessageTimeoutId);
      }
      const duration = getAppMessageDuration(appMessage.level);
      if (duration > 0) {
        const id = setTimeout(() => {
          setAppMessage(undefined);
          setAppMessageTimeoutId(undefined);
        }, duration);
        setAppMessageTimeoutId(id);
      }
      setAppMessage(appMessage);
    },
    [appMessageTimeoutId, setAppMessage, setAppMessageTimeoutId],
  );
}
