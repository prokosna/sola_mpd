import { Box, Text } from "@chakra-ui/react";

import { useGlobalKeyShortcuts } from "../../keyboard_shortcut";
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
	useGlobalKeyShortcuts();
	const userDeviceType = useUserDeviceType();

	if (userDeviceType !== "large") {
		return null;
	}

	return (
		<>
			<Box pl={6} m={0}>
				<Text className="logo-color" fontWeight={"bold"} fontSize={"3xl"}>
					Sola MPD
				</Text>
			</Box>
		</>
	);
}
