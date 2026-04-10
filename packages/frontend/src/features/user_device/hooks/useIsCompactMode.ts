import { useUserDeviceType } from "./useUserDeviceType";

export function useIsCompactMode(): boolean {
	const userDeviceType = useUserDeviceType();
	return userDeviceType === "middle" || userDeviceType === "small";
}
