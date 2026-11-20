import { useEffect, useState } from "react";

type UserDeviceType = "large" | "middle" | "small";

function getDeviceType(width: number): UserDeviceType {
	if (width < 520) {
		return "small";
	}
	if (width < 920) {
		return "middle";
	}
	return "large";
}

export function useUserDeviceType(): UserDeviceType {
	const [deviceType, setDeviceType] = useState(() =>
		getDeviceType(window.innerWidth),
	);

	useEffect(() => {
		const handleResize = () => setDeviceType(getDeviceType(window.innerWidth));
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return deviceType;
}
