import { MutableRefObject, useEffect, useRef } from "react";

/**
 * A custom hook that listens for a specific key combination and triggers a callback.
 *
 * @param ref - A MutableRefObject to the HTML element to attach the event listener to. If undefined, listens globally.
 * @param keys - An array of strings representing the keys that need to be pressed simultaneously.
 * @param onPressed - The function to be called when the key combination is pressed.
 */
export function useInputKeyCombination(
  ref: MutableRefObject<HTMLElement | null> | undefined,
  keys: string[],
  onPressed: () => void,
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
        onPressed();
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
  }, [ref, keys, onPressed]);
}
