import { ActionIcon } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { ROUTE_HOME_SETTINGS } from "../../../const/routes";

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
