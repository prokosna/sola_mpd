import { useState, useEffect } from "react";

/**
 * Hook to detect touch device capability.
 *
 * Listens for first touch event to identify touch-capable
 * devices. Removes listener after detection to optimize
 * performance. Used for adapting UI interactions.
 *
 * @returns True if touch events detected
 */
export function useIsTouchDevice(): boolean {
  const [hasTouched, setHasTouched] = useState(false);

  useEffect(() => {
    const handleTouchStart = () => {
      setHasTouched(true);
      window.removeEventListener("touchstart", handleTouchStart);
    };

    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return hasTouched;
}
