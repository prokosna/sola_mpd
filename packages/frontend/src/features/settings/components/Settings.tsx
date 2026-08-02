import { Box, Tabs } from "@mantine/core";
import { useNavigate, useParams } from "react-router";
import { ROUTE_HOME_SETTINGS } from "../../../const/routes";
import {
	resolveSettingsTabSlug,
	resolveSettingsTabValue,
} from "../functions/settingsTabSlug";
import { Library } from "./Library";
import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";
import { ThisDevice } from "./ThisDevice";

export function Settings() {
	const { tab } = useParams<{ tab?: string }>();
	const navigate = useNavigate();
	const activeTab = resolveSettingsTabValue(tab);

	function handleTabChange(value: string | null) {
		if (value === null) {
			return;
		}
		navigate(`${ROUTE_HOME_SETTINGS}/${resolveSettingsTabSlug(value)}`);
	}

	return (
		<Box w="100%" h="100%">
			<Tabs value={activeTab} onChange={handleTabChange}>
				<Tabs.List>
					<Tabs.Tab value="Profiles">Profiles</Tabs.Tab>
					<Tabs.Tab value="Library">Library</Tabs.Tab>
					<Tabs.Tab value="This device">This device</Tabs.Tab>
					<Tabs.Tab value="Raw Data">Raw Data</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="Profiles">
					<Box p={16}>
						<Profiles />
					</Box>
				</Tabs.Panel>
				<Tabs.Panel value="Library">
					<Box p={16}>
						<Library />
					</Box>
				</Tabs.Panel>
				<Tabs.Panel value="This device">
					<Box p={16}>
						<ThisDevice />
					</Box>
				</Tabs.Panel>
				<Tabs.Panel value="Raw Data">
					<Box p={16}>
						<SettingsStates />
					</Box>
				</Tabs.Panel>
			</Tabs>
		</Box>
	);
}
