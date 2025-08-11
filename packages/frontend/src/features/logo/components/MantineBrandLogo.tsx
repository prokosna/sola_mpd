import { Group, Space, Text } from "@mantine/core";
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
export function MantineBrandLogo() {
	useGlobalKeyShortcuts();
	const userDeviceType = useUserDeviceType();

	if (userDeviceType !== "large") {
		return null;
	}

	return (
		<>
			<Group>
				<Space />
				<Text size="30" fw={700} c="brand">
					Sola MPD
				</Text>
			</Group>
		</>
	);
}
