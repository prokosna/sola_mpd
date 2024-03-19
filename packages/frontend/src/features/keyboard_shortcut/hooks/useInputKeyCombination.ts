import { MutableRefObject, useEffect, useRef } from "react";

export function useInputKeyCombination(
  ref: MutableRefObject<HTMLElement | null> | undefined,
  keys: string[],
  callback: () => void,
): void {
  const keysPressed = useRef(new Set<string>());

  useEffect(() => {
    const onKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      keysPressed.current.add(keyboardEvent.key);

      const activeElement = document.activeElement;
      const isInputActive =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (!isInputActive && keys.every((key) => keysPressed.current.has(key))) {
        keyboardEvent.preventDefault();
        callback();
      }
    };

    const onKeyUp = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      keysPressed.current.delete(keyboardEvent.key);
    };

    const target = ref?.current || window;
    target.addEventListener("keydown", onKeyDown);
    target.addEventListener("keyup", onKeyUp);

    return () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
    };
  }, [ref, keys, callback]);
}
