import { useState, useEffect } from "react";

export function useIsTouchDevice() {
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
