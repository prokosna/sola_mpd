import { useUserDeviceType } from "./useUserDeviceType";

export function useIsCompactMode() {
  const userDeviceType = useUserDeviceType();
  return userDeviceType === "middle" || userDeviceType === "small";
}
