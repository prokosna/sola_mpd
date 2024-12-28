import { useState, useEffect } from "react";

/**
 * A custom hook that detects if the device supports touch events.
 * @returns {boolean} True if the device has touch support, false otherwise.
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
