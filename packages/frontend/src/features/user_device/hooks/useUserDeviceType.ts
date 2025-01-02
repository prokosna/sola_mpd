import { useEffect, useState } from "react";

/**
 * Device type based on screen width.
 *
 * - large: >= 920px
 * - middle: 520px - 919px
 * - small: < 520px
 */
type UserDeviceType = "large" | "middle" | "small";

/**
 * Hook to detect device type from screen size.
 *
 * Monitors window width and categorizes device into
 * large, middle, or small. Updates automatically on
 * window resize. Used for responsive layout decisions.
 *
 * @returns Current device type
 */
export function useUserDeviceType(): UserDeviceType {
	const getDeviceType = (width: number): UserDeviceType => {
		if (width < 520) {
			return "small";
		}
		if (width < 920) {
			return "middle";
		}
		return "large";
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
