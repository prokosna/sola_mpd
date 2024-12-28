import { useState, useEffect } from "react";

type UserDeviceType = "large" | "middle" | "small";

/**
 * A custom hook that returns the current user device type based on window width.
 * @returns {UserDeviceType} The current device type: "large", "middle", or "small".
 */
export function useUserDeviceType(): UserDeviceType {
  const getDeviceType = (width: number): UserDeviceType => {
    if (width < 520) {
      return "small";
    } else if (width < 920) {
      return "middle";
    } else {
      return "large";
    }
  };

  const [deviceType, setDeviceType] = useState(
    getDeviceType(window.innerWidth),
  );

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}
