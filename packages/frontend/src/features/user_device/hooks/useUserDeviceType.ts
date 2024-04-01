import { useState, useEffect } from "react";

type UserDeviceType = "large" | "middle" | "small";

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
