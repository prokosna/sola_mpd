import { Text } from "@mantine/core";
import { useUserDeviceType } from "../../user_device";

/**
 * Brand logo component for the application header.
 *
 * Features:
 * - Responsive display (only shown on large devices)
 * - Custom styling with brand colors
 * - Bold typography with "Sola MPD" text
 * - Global keyboard shortcut support
 *
 * @component
 * @returns The BrandLogo component or null if on a non-large device
 */
export function BrandLogo() {
	const userDeviceType = useUserDeviceType();

	if (userDeviceType !== "large") {
		return null;
	}

	return (
		<Text
			pl={24}
			size="28"
			fw={700}
			c="brand"
			style={{
				lineHeight: "100%",
			}}
		>
			Sola MPD
		</Text>
	);
}
