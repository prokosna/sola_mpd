import { useUserDeviceType } from "./useUserDeviceType";

/**
 * Hook to determine compact mode requirement.
 *
 * Checks device type to decide if compact UI layout is
 * needed. Returns true for middle and small devices to
 * optimize space usage and improve readability.
 *
 * @returns True if compact mode needed
 */
export function useIsCompactMode(): boolean {
  const userDeviceType = useUserDeviceType();
  return userDeviceType === "middle" || userDeviceType === "small";
}
