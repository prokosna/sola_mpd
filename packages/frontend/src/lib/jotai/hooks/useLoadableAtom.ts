import { Atom, useAtomValue } from "jotai";
import { Loadable } from "jotai/vanilla/utils/loadable";

import {
  useSetAppMessageState,
  AppMessageLevel,
} from "../../../features/message";

export function useLoadableAtomValue<T>(
  loadableAtom: Atom<Loadable<T>>,
): Awaited<T> | undefined {
  const loadable = useAtomValue(loadableAtom);
  const updateAppMessage = useSetAppMessageState();

  if (loadable.state === "hasData") {
    return loadable.data;
  } else if (loadable.state === "loading") {
    return undefined;
  } else {
    updateAppMessage({
      level: AppMessageLevel.ERROR,
      message:
        loadable.error instanceof Error
          ? loadable.error.message
          : String(loadable.error),
    });
    return undefined;
  }
}
