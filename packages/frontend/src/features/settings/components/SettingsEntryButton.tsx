import { ActionIcon } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { ROUTE_HOME_SETTINGS } from "../../../const/routes";

/**
 * Settings page navigation button.
 *
 * This component routes users to the settings interface and maintains consistent styling.
 *
 * @component
 * @example
 * ```tsx
 * // In header or navigation area:
 * <SettingsEntryButton />
 * ```
 */
export function SettingsEntryButton() {
	const navigate = useNavigate();

	return (
		<ActionIcon
			size="md"
			variant="transparent"
			onClick={() => {
				navigate(ROUTE_HOME_SETTINGS);
			}}
		>
			<IconSettings />
		</ActionIcon>
	);
}
