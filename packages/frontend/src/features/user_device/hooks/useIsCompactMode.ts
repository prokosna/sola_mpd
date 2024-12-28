import { useUserDeviceType } from "./useUserDeviceType";

/**
 * Hook to determine if the application should use compact mode.
 * @returns {boolean} True if compact mode should be used, false otherwise.
 */
export function useIsCompactMode(): boolean {
  const userDeviceType = useUserDeviceType();
  return userDeviceType === "middle" || userDeviceType === "small";
}
